import { createContext, ReactNode } from 'react'

import ClientController from './controller'

export const clientContext = createContext(null! as ClientController)

export function ClientContext({ children }: { children: ReactNode }) {
  const controller = new ClientController()

  return <clientContext.Provider value={controller}>{children}</clientContext.Provider>
}
