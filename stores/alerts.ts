import { create } from "zustand"

export type ALertType = {
  id: number,
  type: "success" | "error",
  message: string
}

type State = {
  alerts: ALertType[]
}

type Actions = {
  addAlert: (alert: Omit<ALertType, 'id'>) => any
}

const useAlerts = create<State & Actions>((set, get) => ({
  alerts: [],
  addAlert: (alert) => {
    const id = new Date().getTime()

    set(state => ({
      alerts: [{id, ...alert},...state.alerts]
    }))

    setTimeout(() => {
      set(state => ({
        alerts: state.alerts.filter(v => v.id != id)
      }))
    }, 2500)
  }
})
)

export default useAlerts