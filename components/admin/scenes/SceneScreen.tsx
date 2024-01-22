"use client"
import { Dispatch, MouseEvent, SetStateAction, memo, useEffect, useRef, useState } from 'react'
import { renderToString } from 'react-dom/server';
import { Viewer } from "@photo-sphere-viewer/core";
import { EquirectangularTilesAdapter } from "@photo-sphere-viewer/equirectangular-tiles-adapter";
import { AutorotatePlugin } from "@photo-sphere-viewer/autorotate-plugin";
import { MarkerConfig, MarkersPlugin } from "@photo-sphere-viewer/markers-plugin";
import "@photo-sphere-viewer/core/index.css"
import "@photo-sphere-viewer/markers-plugin/index.css"
import { AdvancedHotspotType, SceneDataState } from '@/app/admin/(admin)/scenes/page';
import { AdvancedHotspot, File, InfoHotspot, LinkHotspot } from '@prisma/client';
import LinkHotSpot4 from './hotspots/LinkHotSpot4';
import LinkHotSpot from './hotspots/LinkHotSpot';
import InfoHotSpot from './hotspots/InfoHotSpot';
import InfoHotSpot2 from './hotspots/InfoHotSpot2';
import useSettings from '@/stores/settings';
import useAdminScene from '@/stores/admin/admin_scene';
import { nextLink } from '@/lib/utils/hepler';
import HotspotAddModal from './HotspotAddModal'
// import HotspotAdvancedModal from './HotspotAdvancedModal';
// import dynamic from 'next/dynamic';
// import Loading from '@/components/ui/Loading';

// const HotspotAddModal = dynamic(() => import('./HotspotAddModal'), { loading: () => <Loading /> })

const AdminSceneScreen = ({
  scenes, sceneId, setSceneId, tabCurrentHotspot, setTabCurrentHotspot,
  editHotspotModal, setEditHotspotModal, openHotspotModal, setOpenHotspotModal
}: {
  scenes: SceneDataState[],
  sceneId?: string, 
  setSceneId: Dispatch<SetStateAction<string>>
  tabCurrentHotspot: 'link' | 'info',
  setTabCurrentHotspot: Dispatch<SetStateAction<'link' | 'info'>>;
  editHotspotModal: any | null,
  setEditHotspotModal: Dispatch<SetStateAction<any>>
  openHotspotModal: boolean,
  setOpenHotspotModal: Dispatch<SetStateAction<boolean>>
}) => {
  const isMounted = useRef(false)
  const { findSettingByName } = useSettings()

  const logo = findSettingByName('site logo')

  const viewerHTML = useRef<HTMLDivElement>(null)
  const {viewer, setViewer, addPosition, position, isAdvancedHotspotModal } = useAdminScene()

  // const viewer = useRef<Viewer>()
  const markersPlugin = useRef<MarkersPlugin>()
  const autoRotate = useRef<AutorotatePlugin>()

  const [currentScene, setCurrentScene] = useState<SceneDataState | undefined>(scenes.find(v => v.id == sceneId))

  useEffect(() => {
    setCurrentScene(scenes.find(v => v.id == sceneId))
    changeScene(sceneId)
  }, [sceneId])

  useEffect(() => {
    changeDataScene(scenes)
  }, [scenes])

  const changeScene = (id: string | undefined) => {
    if (!isMounted.current) return
    let scene = scenes.find(v => v.id == id)
    if (scene) {
      autoRotate.current?.setOptions({
        autorotatePitch: scene.initialViewParameters.pitch
      })
      switchScene(scene)
    }
  }

  const changeDataScene = async (data: SceneDataState[]) => {
    let tempCurrentScene = data.find(v => v.id == sceneId)
    if (tempCurrentScene && isMounted.current) {
      markersPlugin.current?.clearMarkers()
      createLinkHotspotElements(tempCurrentScene.linkHotspots)
      createInfoHotspotElements(tempCurrentScene.infoHotspots)
      createAdvancedHotspotElements(tempCurrentScene.advancedHotspots)
    }
  }

  const findSceneDataById = (id: string ) => scenes.find(v => v.id == id)

  async function switchScene(scene: SceneDataState) {
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
      markersPlugin.current?.clearMarkers()
      createLinkHotspotElements(scene.linkHotspots)
      createInfoHotspotElements(scene.infoHotspots)
    })
  }
 
  function createLinkHotspotElements(hotspots: LinkHotspot[]) {
    hotspots.forEach(hotspot => {
      let tooltip = undefined,
        html = undefined,
        image = undefined,
        size = { width: 0, height: 0 }

      if (hotspot?.type == "2") {
        tooltip = findSceneDataById(hotspot.target)?.name || ""
        image = '/asset/img/flycam.png'
        size = { width: 96, height: 96 }
      }
      else if (hotspot?.type == "3") {
        tooltip = findSceneDataById(hotspot.target)?.name || ""
        image = '/asset/img/arrow.png'
        size = { width: 96, height: 96 }
      }
      else if (hotspot?.type == "4") {
        html = renderToString(LinkHotSpot4({title: findSceneDataById(hotspot.target)?.name || ""}))
      }
      else {
        html = renderToString(LinkHotSpot({
          title: findSceneDataById(hotspot.target)?.name || "", 
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
          target: hotspot.target
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
        size: { width, height },
        anchor: 'center',
        content,
        data: {
          type: 'info',
          title: tooltip,
          video: hotspot.video
        },
        tooltip: tooltip
      })
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

  // add hotspot modal
  const [coordinatesAdd , setCoordinatesAdd ] = useState({ yaw: 0, pitch: 0 })

  // hotspot advanced
  const isAdvancedHotspotMarker = useRef(false)

  const createDataMakerConfig = (): MarkerConfig => {
    return {
      id: 'advancedHotspot',
      polygon: position.map(v => [v.yaw, v.pitch]) as [number, number][],
      svgStyle: {
        stroke: 'rgba(2, 132, 199, 0.8)',
        strokeWidth: '2px',
        strokeLinejoin: 'round',
        fill: 'rgba(2, 133, 199, 0.2)',
        pointerEvents: 'none'
      }
    }
  }

  useEffect(() => {
    if (isAdvancedHotspotModal && position.length > 0) {
      markersPlugin.current?.addMarker(createDataMakerConfig())
      isAdvancedHotspotMarker.current = true
    }
    else if (!isAdvancedHotspotModal && position.length > 0){
      markersPlugin.current?.removeMarker("advancedHotspot")
      isAdvancedHotspotMarker.current = false
    }
  }, [isAdvancedHotspotModal])

  useEffect(() => {
    if (!isAdvancedHotspotModal) return
    
    if (position.length == 0 && isAdvancedHotspotMarker.current) {
      markersPlugin.current?.removeMarker("advancedHotspot")
      isAdvancedHotspotMarker.current = false
    }
    else if (position.length > 0 && !isAdvancedHotspotMarker.current) {
      markersPlugin.current?.addMarker(createDataMakerConfig())
      isAdvancedHotspotMarker.current = true
    }
    else if (position.length > 0 && isAdvancedHotspotMarker.current){
      markersPlugin.current?.updateMarker(createDataMakerConfig())
    }
  }, [position])


  useEffect(() => {
    if (!viewerHTML.current) return

    const tempViewer = new Viewer({
      container: viewerHTML.current,
      adapter: EquirectangularTilesAdapter,
      navbar: false,
      plugins: [
        [AutorotatePlugin, {
          autostartDelay: null,
          autostartOnIdle: false,
          autorotatePitch: currentScene?.initialViewParameters.pitch,
          autorotateSpeed: '0.5rpm',
        }],
        MarkersPlugin
      ],

      defaultPitch: currentScene?.initialViewParameters.pitch,
      defaultYaw: currentScene?.initialViewParameters.yaw,
      defaultZoomLvl: currentScene?.initialViewParameters.zoom,

      touchmoveTwoFingers: true,
      panorama: {
        width: currentScene?.faceSize,
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

    createLinkHotspotElements(currentScene?.linkHotspots || [])
    createInfoHotspotElements(currentScene?.infoHotspots || [])
    createAdvancedHotspotElements(currentScene?.advancedHotspots || [])

    markersPlugin.current.addEventListener('select-marker', ({ marker }) => {
      if (marker.data?.type == "link" && marker.data?.target) {
        if (marker.data?.target)
          setSceneId(marker.data.target)
      }
      
      if (marker.data?.type == "info") {
        if (marker.data?.video) {
          // $videoShow = marker.data?.video
        }
      }
    })

    tempViewer.addEventListener('dblclick', ({ data }) => {
      const isAdvancedHotspotModal = useAdminScene.getState().isAdvancedHotspotModal

      if (isAdvancedHotspotModal) {
        addPosition(data)
      }
      else {
        setCoordinatesAdd({
          yaw: data.yaw,
          pitch: data.pitch
        })
  
        setEditHotspotModal(null)
        setOpenHotspotModal(true)
      }
    })

    isMounted.current = true

    return () => {
      if(viewer) {
        viewer?.destroy()
        markersPlugin.current?.clearMarkers()
      }
    }
  }, [])

  return (
    <>
      <style jsx global>{`
        .psv-container {
          cursor: auto !important;
        }
      `}</style>
      { scenes.length > 0
        ? <div ref={viewerHTML} className='w-full h-full'></div>
        : <div className="w-full h-full grid place-items-center">Không có điểm chụp nào</div>
      }
      
      <HotspotAddModal 
        scenes={scenes}
        data={editHotspotModal}
        tabCurrentHotspot={tabCurrentHotspot} 
        setTabCurrentHotspot={setTabCurrentHotspot} 
        sceneId={sceneId} 
        coordinates={coordinatesAdd} 
        open={openHotspotModal} 
        setOpen={setOpenHotspotModal} 
      />
    </>
  )
}

export default memo(AdminSceneScreen)