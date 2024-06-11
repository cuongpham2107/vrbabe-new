
import React, { ReactNode } from 'react';
import { Metadata, ResolvingMetadata } from 'next';
import { findSettingByName } from '@/lib/admin/fields';
import db from '@/lib/admin/db';
import { InitialViewParametersState, LevelsState, SceneDataState } from '../admin/(admin)/scenes/page';
import { getSettingsData } from '@/actions/admin/settings';
import { getAdmin } from '@/actions/admin/admin';
import PreviewWithAuth from '@/components/web/content/PreviewWithAuth';
import SceneContent from '@/components/web/content/SceneContent';
// import dynamic from 'next/dynamic';
// const SceneContent = dynamic(() => import("@/components/web/content/SceneContent"), { ssr: false });

export const dynamic = 'force-dynamic'

export async function generateMetadata(
  parent?: ResolvingMetadata
): Promise<Metadata> {
  const settings = await getSettingsData()

  const siteTitle = findSettingByName(settings, "site title")
  const siteDescription = findSettingByName(settings, "site description")
  const siteLogo = findSettingByName(settings, "site logo")
 
  return {
    metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
    title: siteTitle || "Việt Hùng It",
    description: siteDescription || 'Việt Hùng It lập trình viên web, mobile, hệ thống',
    authors: {
      name: 'Việt Hùng It',
      url: 'https://github.com/rowdy-dowdy'
    },
    twitter: {
      title: siteTitle || "Việt Hùng It",
      description: siteDescription || 'Việt Hùng It lập trình viên web, mobile, hệ thống',
      images: siteLogo ? siteLogo?.url : null,
    },
    openGraph: {
      title: siteTitle || "Việt Hùng It",
      description: siteDescription || 'Việt Hùng It lập trình viên web, mobile, hệ thống',
      url: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
      siteName: siteTitle || "Việt Hùng It",
      images: siteLogo ? siteLogo?.url : null,
      type: 'website',
    },
  }
}

export type SceneProps = Omit<SceneDataState, 'image'>

const getData = async () => {
  "use server"
  const [scenes, groups] = await Promise.all([
    db.scene.findMany({
      where: {
        publish: 'publish',
      },
      include: {
        infoHotspots: true,
        linkHotspots: true,
        advancedHotspots: {
          include: {
            layer: true
          }
        },
        audio: true,
        group: true
      },
      orderBy: {
        sort: 'asc'
      }
    }),
    db.groupScene.findMany({
      where: {
        publish: 'publish'
      },
      orderBy: {
        sort: 'asc'
      }
    })
  ])

  let scenesData: SceneProps[] = scenes.map(v => {
    return {
      ...v,
      levels: JSON.parse(v.levels) as LevelsState,
      initialViewParameters: JSON.parse(v.initialViewParameters) as InitialViewParametersState,
      advancedHotspots: v.advancedHotspots.map(v2 => ({
        ...v2,
        position: JSON.parse(v2.position) as {yaw: number, pitch: number}[]
      })),
      audio_en: null // Add the missing audio_en property
    }
  })

  let scenesGroup: SceneProps[] = []
  let groupsData = groups.filter(v => {
    let scenesInGroup = scenesData.filter(v2 => v2.groupId == v.id)

    if (scenesInGroup.length > 0) {
      scenesGroup.push(...scenesData.filter(v2 => v2.groupId == v.id))
      return true
    }
    else {
      return false
    }
  })

  const scenesNonGroup = scenesData.filter(v => !v.groupId)

  return { scenes: scenesGroup, scenesNonGroup, groups: groupsData }
}


const layout = async ({children}: {children: ReactNode}) => {
  const settings = await getSettingsData()
  const previewWhenLogging = findSettingByName(settings, "preview mode") as boolean | null

  if (previewWhenLogging) {
    const user = await getAdmin()

    if (!user) {
      return <PreviewWithAuth />
    }
  }

  const {scenes, scenesNonGroup, groups} = await getData()
  
  return (
    <>
    
    <SceneContent scenes={scenes} scenesNonGroup={scenesNonGroup} groups={groups} children={children} />
    
    </>
  )
}

export default layout