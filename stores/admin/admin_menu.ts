import { useEffect, useState } from "react"
import { create } from "zustand"
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware'

type State = {
  open: boolean,
  width: string,
}

type Actions = {
  toggle: (data?: boolean) => void
}

const NAME = "admin-menu"

const useAdminMenu = create(
  persist<State & Actions>(
    (set, get) => ({
      open: false,
      width: "16rem",
      toggle: (data) => set({
        open: data ? data : !get().open
      })
    }),
    {
      name: NAME,
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)

export default useAdminMenu