import { createContext, ReactNode, useContext } from 'react'

import ClientController from './controller'
import { useStore } from '@/state'
import { Client } from 'chaty-client'
import { User } from 'chaty-client/models'

export * from './controller'

export const clientContext = createContext(null! as ClientController)

export function ClientContext({ children }: { children: ReactNode }) {
  const controller = new ClientController(useStore)

  return <clientContext.Provider value={controller}>{children}</clientContext.Provider>
}

/**
 * Get the currently active client if one is available
 * @returns Client
 */
export function useClient(): Client {
  const controller = useContext(clientContext)
  return controller.getCurrentClient()
}

export function useLifecycle() {
  const { lifecycle } = useContext(clientContext)
  return { lifecycle }
}

/**
 * Get the currently logged in user
 * @returns User
 */
export function useUser(): User | undefined {
  const controller = useContext(clientContext)
  return controller.getCurrentClient()!.user
}
