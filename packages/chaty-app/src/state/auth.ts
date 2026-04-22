import { create } from 'zustand'
import localforage from 'localforage'

export type Session = {
  id: string
  token: string
  userId: string
  valid: boolean
}

interface AuthState {
  session?: Session
  setSession: (session: Session) => void
  removeSession: () => void
  markValid: () => void
  hydrate: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  session: undefined,
  setSession: (session) => {
    set({ session })
    localforage.setItem('auth', { session })
  },

  removeSession: () => {
    set({ session: undefined })
    localforage.removeItem('auth')
  },

  markValid: () => {
    const session = get().session
    if (session && !session.valid) {
      const updated = { ...session, valid: true }
      set({ session: updated })
      localforage.setItem('auth', { session: updated })
    }
  },

  hydrate: async () => {
    if ((process.env.NEXT_PUBLIC_DEV_SESSION_ID ?? '') && (process.env.NEXT_PUBLIC_DEV_USER_ID ?? '')) {
      set({
        session: {
          id: process.env.NEXT_PUBLIC_DEV_SESSION_ID ?? '',
          token: process.env.NEXT_PUBLIC_DEV_TOKEN ?? '',
          userId: process.env.NEXT_PUBLIC_DEV_USER_ID ?? '',
          valid: true,
        },
      })
      return
    }

    const data = await localforage.getItem<{ session: Session }>('auth')
    if (data?.session) {
      const { id, token, userId, valid } = data.session
      if (id && token && userId) {
        set({ session: { id, token, userId, valid } })
      }
    }
  },
}))
