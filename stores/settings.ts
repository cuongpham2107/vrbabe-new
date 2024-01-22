import { create } from "zustand"

type State = {
  settings: any[]
}

type Actions = {
  findSettingByName: (name: string) => any
}

const useSettings = create<State & Actions>((set, get) => ({
  settings: [],
  findSettingByName: (name) => {
    return get().settings.find(v => v.name == name)?.value || undefined
  }
})
)

export default useSettings