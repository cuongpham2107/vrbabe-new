"use client"

import InfoHotSpot from "@/components/admin/scenes/hotspots/InfoHotSpot"
import InfoHotSpot2 from "@/components/admin/scenes/hotspots/InfoHotSpot2"
import LinkHotSpot from "@/components/admin/scenes/hotspots/LinkHotSpot"
import LinkHotSpot4 from "@/components/admin/scenes/hotspots/LinkHotSpot4"
import useSettings from "@/stores/settings"
import useScene from "@/stores/web/scene"
import { AutorotatePlugin } from "@photo-sphere-viewer/autorotate-plugin"
import { Viewer, utils } from "@photo-sphere-viewer/core"
import { EquirectangularTilesAdapter } from "@photo-sphere-viewer/equirectangular-tiles-adapter"
import { MarkersPlugin } from "@photo-sphere-viewer/markers-plugin"
import { InfoHotspot, LinkHotspot } from "@prisma/client"
import { usePathname, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { renderToString } from "react-dom/server"
import dynamic from "next/dynamic"

import "@photo-sphere-viewer/core/index.css"
import "@photo-sphere-viewer/markers-plugin/index.css"
import styles from "./scenes.module.css";

const LeftSideScene = dynamic(() => import("./LeftSideScene"))
const BarOptionsScene = dynamic(() => import("./BarOptionsScene"))
const VideoShowScene = dynamic(() => import("./VideoShowScene"))

import "./tinymce.css";
import { SceneProps } from "@/app/(web)/layout"
import { AdvancedHotspotType } from "@/app/admin/(admin)/scenes/page"
import GoogleMap from "./GoogleMap"

const ScenesScreen = () => {
  const router = useRouter()
  const pathname = usePathname()

  const isMounted = useRef(false)
  const { findSettingByName } = useSettings()
  const logo = findSettingByName('site logo')

  const { start, scenes, scenesNonGroup, viewer, setViewer, videoShow, setVideoShow } = useScene()

  const [sceneSlug, setSceneSlug] = useState<string | undefined>(pathname?.split('/')[1])
  const viewerHTML = useRef<HTMLDivElement>(null)
  const markersPlugin = useRef<MarkersPlugin>()
  const autoRotate = useRef<AutorotatePlugin>()

  const [currentScene, setCurrentScene] = useState<SceneProps | undefined>(
    sceneSlug ? [...scenes, ...scenesNonGroup].find(v => v.slug == sceneSlug) || [...scenes, ...scenesNonGroup][0] : [...scenes, ...scenesNonGroup][0]
  )

  useEffect(() => {
    const slug = pathname?.split('/')[1]
    const tempScene = [...scenes, ...scenesNonGroup].find(v => v.slug == slug) || [...scenes, ...scenesNonGroup][0]

    setSceneSlug(slug)
    setCurrentScene(tempScene)

    if (tempScene) {
      changeScene(tempScene)
    }
  }, [pathname])

  const changeScene = (scene: SceneProps) => {
    if (!isMounted.current) return

    autoRotate.current?.setOptions({
      autorotatePitch: scene.initialViewParameters.pitch
    })
    switchScene(scene)
  }

  const findSceneDataById = (id: string) => [...scenes, ...scenesNonGroup].find(v => v.id == id)

  async function switchScene(scene: SceneProps) {
    toggleAutoRotate(false)

    await new Promise(res => {
      markersPlugin.current?.clearMarkers()
      res(1)
    })

    viewer?.setPanorama({
      width: scene.faceSize,
      cols: 8,
      rows: 4,
      baseUrl: `/storage/tiles/${scene.id}/low.webp`,
      tileUrl: (col: number, row: number) => {
        return `/storage/tiles/${scene.id}/${row}_${col}.webp`
      },
    }, {
      position: {
        pitch: scene.initialViewParameters.pitch,
        yaw: scene.initialViewParameters.yaw,
      },
      zoom: scene.initialViewParameters.zoom,
      showLoader: false,
      // transition: 100,
      // speed: '10rpm'

      // overlay: false
    }).then(v => {
      // markersPlugin.current?.clearMarkers()
      createLinkHotspotElements(scene.linkHotspots)
      createInfoHotspotElements(scene.infoHotspots)
      createAdvancedHotspotElements(scene.advancedHotspots)

      if (autoRotateCheck) {
        toggleAutoRotate(true)
      }
    })
  }
 
  function createLinkHotspotElements(hotspots: LinkHotspot[]) {
    hotspots.forEach(hotspot => {
      let tooltip = undefined,
        html = undefined,
        image = undefined,
        size = { width: 0, height: 0 }

      const scene = findSceneDataById(hotspot.target)

      if (!scene) return

      if (hotspot?.type == "2") {
        tooltip = scene?.name || ""
        image = '/asset/img/flycam.png'
        size = { width: 96, height: 96 }
      }
      else if (hotspot?.type == "3") {
        tooltip = scene?.name || ""
        image = '/asset/img/arrow.png'
        size = { width: 96, height: 96 }
      }
      else if (hotspot?.type == "4") {
        html = renderToString(LinkHotSpot4({title: scene?.name || ""}))
      }
      else {
        html = renderToString(LinkHotSpot({
          title: scene?.name || "", 
          image: `/storage/tiles/${hotspot.target}/fisheye.webp`,
          logo: logo?.url
        }))
      }

      markersPlugin.current?.addMarker({
        id: hotspot.id,
        position: { yaw: hotspot.yaw, pitch: hotspot.pitch },
        html: html,
        image: image,
        size: size,
        anchor: 'center',
        data: {
          type: 'link',
          target: scene?.slug
        },
        tooltip: tooltip,
        className: "psv-marker--custom"
      });
    })
  }

  function createInfoHotspotElements(hotspots: InfoHotspot[]) {
    hotspots.forEach(hotspot => {
      let tooltip = undefined,
        html = undefined,
        image = undefined,
        content = undefined,
        width = 40, height = 40

      if (hotspot?.type == "2") {
        tooltip = hotspot.title ?? ''
        html = renderToString(InfoHotSpot2())
      }
      else if (hotspot?.type == "3") {
        html = renderToString(LinkHotSpot4({title: hotspot.title ?? ''}))
        content = hotspot.description ?? ''
        width = height = 0
      }
      else {
        tooltip = hotspot.title ?? ''
        content = hotspot.description ?? ''
        html = renderToString(InfoHotSpot())
      }

      markersPlugin.current?.addMarker({
        id: hotspot.id,
        position: { yaw: hotspot.yaw, pitch: hotspot.pitch },
        html: html,
        image: image,
        size: { width: width, height: height },
        anchor: 'center',
        content,
        data: {
          type: 'info',
          title: tooltip,
          video: hotspot.video
        },
        tooltip: tooltip
      });
    })
  }

  function createAdvancedHotspotElements(hotspots: AdvancedHotspotType[]) {
    hotspots.forEach(hotspot => {
      if (hotspot.type == "layer") {
        if (!hotspot.layer) return

        const file = hotspot.layer

        markersPlugin.current?.addMarker({
          id: hotspot.id,
          [file.mime.startsWith('image/') ? 'imageLayer' : 'videoLayer']: file.url,
          position: hotspot.position as any,
          tooltip: {
            content: hotspot.title
          },
        })
      }
      else {
        markersPlugin.current?.addMarker({
          id: hotspot.id,
          className: 'marker-polygon',
          polygon: hotspot.position.map(v => [v.yaw, v.pitch]) as any,
          svgStyle: {
            stroke: 'rgba(2, 132, 199, 0.8)',
            strokeWidth: '2px',
            strokeLinejoin: 'round',
            fill: 'rgba(2, 133, 199, 0.2)',
          },
          tooltip: {
            content: hotspot.title
          },
        })
      }
    })
  }

  // toggle scene
  const [autoRotateCheck, setAutoRotateCheck] = useState(false)

  function toggleAutoRotate(value?: boolean) {
    if (value != undefined) {
      value ? autoRotate.current?.start() : autoRotate.current?.stop()
      setAutoRotateCheck(value)
      autoRotate.current?.setOptions({
        autostartOnIdle: value,
      });
      return
    }

    if (autoRotateCheck) {
      autoRotate.current?.stop()
      autoRotate.current?.setOptions({
        autostartOnIdle: false,
      });
      setAutoRotateCheck(false)
    } 
    else {
      autoRotate.current?.setOptions({
        autostartOnIdle: true,
      });
      autoRotate.current?.start()
      setAutoRotateCheck(true)
    }
  }

  // stop auto rotate in video show
  useEffect(() => {
    changeVideoShow(videoShow)
  }, [videoShow])

  let autoRotateAfterVideoShow = true
  const changeVideoShow = (videoShow: string | undefined) => {
    if (videoShow != null) {
      autoRotateAfterVideoShow = autoRotateCheck
      toggleAutoRotate(false)
    }
    else {
      if (autoRotateAfterVideoShow) { 
        toggleAutoRotate(true)
      }
    }
  }

  // intro and default animated values

  const animatedValues = useRef({
    pitch: { start: -Math.PI / 2, end: currentScene?.initialViewParameters?.pitch || 0.2 },
    yaw: { start: ((currentScene?.initialViewParameters?.yaw || 0) - 5), end: currentScene?.initialViewParameters?.yaw || 0 },
    zoom: { start: 0, end: currentScene?.initialViewParameters?.zoom || 50 },
    fisheye: { start: 2, end: 0 },
  })

  const intro = () => {
    autoRotate.current?.stop();
    // markersPlugin?.hideAllMarkers()

    new utils.Animation({
      properties: animatedValues.current,
      duration: 2500,
      easing: "inOutQuad",
      onTick: (properties) => {
        viewer?.setOption("fisheye", properties.fisheye);
        viewer?.rotate({ yaw: properties.yaw, pitch: properties.pitch });
        viewer?.zoom(properties.zoom);
      },
    }).then(() => {
      createLinkHotspotElements(currentScene?.linkHotspots || [])
      createInfoHotspotElements(currentScene?.infoHotspots || [])
      createAdvancedHotspotElements(currentScene?.advancedHotspots || [])

      autoRotate.current?.setOptions({
        autorotatePitch: currentScene?.initialViewParameters.pitch,
        autostartDelay: 1000,
        autostartOnIdle: true,
      });
      autoRotate.current?.start();

      // markersPlugin?.showAllMarkers()
    });
  }

  useEffect(() => {
    if (start) {
      intro()
    }
  }, [start])

  useEffect(() => {
    if (!viewerHTML.current || typeof window == "undefined") return

    const tempViewer = new Viewer({
      container: viewerHTML.current,
      adapter: EquirectangularTilesAdapter,
      navbar: false,
      plugins: [
        [AutorotatePlugin, {
          autostartDelay: null,
          autostartOnIdle: false,
          autorotatePitch: currentScene?.initialViewParameters?.pitch,
          autorotateSpeed: '0.2rpm',
        }],
        MarkersPlugin
      ],

      defaultPitch: animatedValues.current.pitch.start,
      defaultYaw: animatedValues.current.yaw.start,
      defaultZoomLvl: animatedValues.current.zoom.start,
      fisheye: animatedValues.current.fisheye.start,

      touchmoveTwoFingers: true,
      panorama: {
        width: currentScene?.faceSize || 8192,
        cols: 8,
        rows: 4,
        baseUrl: `/storage/tiles/${currentScene?.id}/low.webp`,
        tileUrl: (col: number, row: number) => {
          return `/storage/tiles/${currentScene?.id}/${row}_${col}.webp`
        },
      },
    })

    setViewer(tempViewer)

    markersPlugin.current = tempViewer.getPlugin(MarkersPlugin) as MarkersPlugin
    autoRotate.current = tempViewer.getPlugin(AutorotatePlugin) as AutorotatePlugin

    markersPlugin.current.addEventListener('select-marker', ({ marker }) => {
      if (marker.data?.type == "link" && marker.data?.target) {
        if (marker.data?.target) {
          router.push(`/${marker.data.target}`)
        }
      }
      
      if (marker.data?.type == "info") {
        if (marker.data?.video) {
          setVideoShow(marker.data.video)
        }
      }
    })

    isMounted.current = true

    return () => {
      tempViewer?.destroy()
    }
  }, [])

  return (
    <>
      <div id="viewer" ref={viewerHTML}  className={`w-full h-screen ${styles.viewer}`} />
      
      <LeftSideScene sceneSlug={sceneSlug} currentScene={currentScene} />
      <BarOptionsScene autoRotateCheck={autoRotateCheck} toggleAutoRotate={toggleAutoRotate} currentScene={currentScene} />
      <VideoShowScene />
      <GoogleMap />
    </>
  )
}

export default ScenesScreen