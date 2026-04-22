import 'client-only'
import { useAppStore, useAuthStore, useGroupsStore } from '@/state'
import { createContext, ReactNode, useEffect, useState } from 'react'

export const useStore = {
  app: useAppStore,
  groups: useGroupsStore,
  auth: useAuthStore,
}

export type StoreType = typeof useStore

/**
 * Global hydration function to be called at app start
 */
export async function hydrateAllStores() {
  await Promise.all([useAuthStore.getState().hydrate()])

  if (process.env.NODE_ENV === 'development') {
    console.info('[store] All stores hydrated from disk.')
  }
}

const StateContext = createContext<null>(null)

export function StateProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    ; (async () => {
      await hydrateAllStores()
      setReady(true)
    })()
  }, [])

  if (!ready) return null

  return <StateContext.Provider value={null}>{children}</StateContext.Provider>
}
