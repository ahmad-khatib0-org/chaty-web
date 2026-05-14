import { create, StateCreator } from 'zustand'
import { devtools } from 'zustand/middleware'

interface LinkSafetyState {
  savedOrigins: string[]
  isTrusted: (url: URL) => boolean
  trust: (url: URL) => void
  reset: () => void
}

const storeFn: StateCreator<LinkSafetyState> = (set, get) => ({
  savedOrigins: [],

  isTrusted: (url: URL) => {
    return get().savedOrigins.includes(url.origin)
  },

  trust: (url: URL) => {
    const currentOrigins = get().savedOrigins
    if (currentOrigins.includes(url.origin)) return

    set({ savedOrigins: [...currentOrigins, url.origin] })
  },

  reset: () => {
    set({ savedOrigins: [] })
  },
})

export const useLinkSafetyStore =
  process.env.NODE_ENV === 'development'
    ? create<LinkSafetyState>()(devtools(storeFn, { name: 'LinkSafety Store', enabled: false }))
    : create<LinkSafetyState>()(storeFn)
