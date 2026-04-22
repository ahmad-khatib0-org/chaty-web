import { create, StateCreator } from 'zustand'
import { devtools } from 'zustand/middleware'

import { GroupsListItem } from '@chaty-app/proto/web/service/v1/groups_pb'
import { Channel } from '@chaty-app/proto/web/service/v1/channels_db_pb'

interface GroupsState {
  currentGroup: null | GroupsListItem
  setCurrentGroup: (group: GroupsListItem | null) => void
  channel: null | Channel
  setChannel: (channel: Channel) => void
}

const storeFn: StateCreator<GroupsState> = (set) => ({
  currentGroup: null,
  setCurrentGroup: (currentGroup) => set({ currentGroup }),
  channel: null,
  setChannel: (channel: Channel) => set({ channel }),
})

export const useGroupsStore =
  process.env.NODE_ENV === 'development'
    ? create<GroupsState>()(devtools(storeFn, { name: 'Groups Store', enabled: false }))
    : create<GroupsState>()(storeFn)
