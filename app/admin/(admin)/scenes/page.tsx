import { checkPermissions } from '@/lib/admin/fields'
import db from '@/lib/admin/db'
import { AdvancedHotspot, File, GroupScene, InfoHotspot, LinkHotspot, Scene } from '@prisma/client'
import React from 'react'
import { getAdmin } from '@/actions/admin/admin'
import SceneContentAdmin from '@/components/admin/content/SceneContentAdmin'

export type LevelsState = {
  tileSize: number,
  size: number,
  fallbackOnly?: boolean
}[]

export type InitialViewParametersState = {
  pitch: number,
  yaw: number,
  zoom: number
}

export type AdvancedHotspotType = Omit<AdvancedHotspot, 'position'> & {
  layer: File | null,
  position: {yaw: number, pitch: number}[]
}

export type SceneDataState =  (Omit<Scene, 'levels' | 'initialViewParameters'> & {
  levels: LevelsState;
  initialViewParameters: InitialViewParametersState;
  infoHotspots: InfoHotspot[];
  linkHotspots: LinkHotspot[];
  advancedHotspots: AdvancedHotspotType[]
  image: File | null,
  audio: File | null,
  audio_en: File | null,
  group: GroupScene | null
})

const getData = async () => {
  const scenes = await db.scene.findMany({
    include: {
      infoHotspots: true,
      linkHotspots: true,
      advancedHotspots: {
        include: {
          layer: true
        }
      },
      image: true,
      audio: true,
      audio_en: true,
      group: true
    },
    orderBy: {
      sort: 'asc'
    }
  })

  let scenesData: SceneDataState[] = scenes.map(v => {
    return {
      ...v,
      levels: JSON.parse(v.levels) as LevelsState,
      initialViewParameters: JSON.parse(v.initialViewParameters) as InitialViewParametersState,
      advancedHotspots: v.advancedHotspots.map(v2 => ({
        ...v2,
        position: JSON.parse(v2.position) as {yaw: number, pitch: number}[]
      }))
    }
  })

  return { scenes: scenesData }
}

const page = async () => {
  const admin = await getAdmin()

  if (!checkPermissions(admin?.role.permissions || [], "scene", "browse")) {
    return <div>Bạn không có quyền truy cập trang này</div>
  }

  const { scenes } = await getData()

  return (
    <SceneContentAdmin scenes={scenes} />
  )
}

export default page