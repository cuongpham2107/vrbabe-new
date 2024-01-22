import { SceneProps } from "@/app/(web)/layout"
import { Viewer } from "@photo-sphere-viewer/core"
import { GroupScene } from "@prisma/client"
import { create } from "zustand"

type State = {
  start: boolean,
  viewer?: Viewer,
  scenes: SceneProps[],
  scenesNonGroup: SceneProps[],
  groups: GroupScene[]
  videoShow?: string,
  showListScene: boolean,
  googleMap?: boolean
}

type Actions = {
  setStart: (data: boolean) => void
  setViewer: (data: Viewer) => void,
  setScenes:( data: SceneProps[]) => void,
  setGroups:( data: GroupScene[]) => void,
  setVideoShow: (data: string | undefined) => void
  setShowListScene: (data?: boolean) => void
}

const useScene = create<State & Actions>(set => ({
  start: false,
  setStart: (data) => set({
    start: data
  }),

  videoShow: undefined,
  setVideoShow: (data) => set({
    videoShow: data
  }),

  viewer: undefined,
  setViewer: (data) => set({
    viewer: data
  }),
  
  scenes: [],
  scenesNonGroup: [],
  setScenes: (data) => set({
    scenes: data
  }),

  groups: [],
  setGroups: (data) => set({
    groups: data
  }),

  showListScene: true,
  // setShowListScene: (data) => set({
  //   showListScene: data
  // }),
  setShowListScene: (data) => set((state) => ({
    showListScene: data ? data : !state.showListScene
  })),

  // allowedPlayAudio: false,
  // setAllowedPlayAudio: (data) => set({
  //   allowedPlayAudio: data
  // }),
})
)

export default useScene