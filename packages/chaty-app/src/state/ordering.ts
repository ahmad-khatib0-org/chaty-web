import { create, StateCreator } from 'zustand'
import { devtools } from 'zustand/middleware'

import { Client } from 'chaty-client'
import { Channel, ChannelType, Server } from 'chaty-client/models'

interface OrderingState {
  servers: string[]
  orderedServers: (client: Client) => Server[]
  setServerOrder: (ids: string[]) => void
  orderedConversations: (client: Client) => Channel[]
}

const storeFn: StateCreator<OrderingState> = (set, get) => ({
  servers: [],

  orderedServers: (client: Client) => {
    const known = new Set(client?.servers.keys() ?? [])
    const ordered = [...get().servers]

    const out = []
    for (const id of ordered) {
      if (known.delete(id)) {
        out.push(client!.servers.get(id)!)
      }
    }

    for (const id of known) {
      out.push(client!.servers.get(id)!)
    }

    return out
  },

  setServerOrder: (ids: string[]) => {
    set({ servers: ids })
  },

  orderedConversations: (client: Client) => {
    return client.channels
      .toList()
      .filter(
        (chan) =>
          (chan.type === ChannelType.DirectMessage && chan.direct?.active) || chan.type === ChannelType.Group
      )
      .sort((a, b) => +b.updatedAt - +a.updatedAt)
  },
})

export const useOrderingStore =
  process.env.NODE_ENV === 'development'
    ? create<OrderingState>()(devtools(storeFn, { name: 'Ordering Store', enabled: false }))
    : create<OrderingState>()(storeFn)
