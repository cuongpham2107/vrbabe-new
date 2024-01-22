import { AdvancedHotspotType, SceneDataState } from "@/app/admin/(admin)/scenes/page"
import { Viewer } from "@photo-sphere-viewer/core"
import { v4 } from "uuid"
import { create } from "zustand"

type State = {
  viewer?: Viewer,
  scenes: SceneDataState[],
  isAdvancedHotspotModal: boolean,
  type: 'layer' | 'polygon',
  position: { id: string, yaw: number, pitch: number }[],
  advancedHotSpotDelete?: AdvancedHotspotType,
  advancedHotSpotEdit?: AdvancedHotspotType,
}

type Actions = {
  setViewer: (data: Viewer) => void,
  openAdvancedHotspotModal: (hotspot?: AdvancedHotspotType) => void
  changeType: (type: 'layer' | 'polygon') => void
  addPosition: (data: { yaw: number, pitch: number }) => void,
  deletePosition: (id: string) => void,
}

const useAdminScene = create<State & Actions>((set, get) => ({
  scenes: [],
  viewer: undefined,
  setViewer: (data) => set({
    viewer: data
  }),

  isAdvancedHotspotModal: false,
  openAdvancedHotspotModal: (hotspot) => {
    if (hotspot) {
      set({
        advancedHotSpotEdit: hotspot, isAdvancedHotspotModal: true,
        type: hotspot.type as any, 
        position: hotspot.position.map(v => ({...v, id: v4()})),
      })
    } 
    else {
      set({
        advancedHotSpotEdit: undefined, isAdvancedHotspotModal: true,
        type: 'polygon', position: [],
      })
    }
  },
  type: 'polygon',
  changeType: (type) => {
    set(state => ({type, position: type == 'layer' ? state.position.slice(0,4) : state.position}))
  },

  position: [],
  addPosition: (data) => {
    const max = get().type == 'layer' ? 4 : Number.MAX_SAFE_INTEGER

    if (get().position.length < max) {
      set(state => ({position: [...state.position, {id : v4(), yaw: data.yaw, pitch: data.pitch} ]}))
    }
  },
  deletePosition: (id) => {
    set(state => ({position:state.position.filter(v => v.id != id)}))
  }
})
)

export default useAdminScene