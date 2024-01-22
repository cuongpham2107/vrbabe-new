import { AdminType } from "@/actions/admin/admin";
import { create } from "zustand";

type UserType = {
  user: AdminType
  save: (data: AdminType) => void
}

const useAdminUser = create<UserType>(set => ({
  user: null,
  save: (data: AdminType) => set(state => ({
    user: data
  }))
}))

export default useAdminUser