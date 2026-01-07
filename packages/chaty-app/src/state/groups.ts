import { create, StateCreator } from 'zustand'
import { devtools } from 'zustand/middleware'

interface GroupsState {
  msg: null | any
  setMsg: (msg: null | any) => void
}

const storeFn: StateCreator<GroupsState> = (set) => ({
  msg: null,
  setMsg: (msg) => set({ msg }),
})

export const useGroupsStore =
  process.env.NODE_ENV === 'development'
    ? create<GroupsState>()(devtools(storeFn, { name: 'Groups Store' }))
    : create<GroupsState>()(storeFn)
