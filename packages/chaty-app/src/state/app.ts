import 'client-only'
import { create, StateCreator } from 'zustand'
import { devtools } from 'zustand/middleware'

import { ClientEssentialInformation, ClientInformation, createDefaultClientInformation } from '@/types/client'
import { ConnectionState } from 'chaty-client/events'

interface AppState {
  clientInfo: ClientInformation & { email?: string }
  setClientInfo: (info: ClientInformation & { email?: string }) => void
  clientEssentialInfo: { languageName: string; languageSymbol: string; currency: string; country: string }
  setClientEssentialInfo: (info: ClientEssentialInformation) => void
  updateClientInfo: (updates: Partial<ClientInformation> & { email?: string }) => void

  clientConnState: ConnectionState
  setClientConnState: (state: ConnectionState) => void
}

const storeFn: StateCreator<AppState> = (set) => ({
  clientInfo: createDefaultClientInformation(),
  setClientInfo: (clientInfo: ClientInformation) => set({ clientInfo }),
  clientEssentialInfo: { languageName: '', languageSymbol: '', currency: '', country: '' },
  setClientEssentialInfo: (info) => set((state) => ({ clientInfo: state.clientInfo, ...info })),
  updateClientInfo: (updates) =>
    set((state) => ({
      clientInfo: { ...state.clientInfo, ...updates },
    })),
  clientConnState: ConnectionState.Disconnected,
  setClientConnState: (clientConnState) => set({ clientConnState }),
})

export const useAppStore =
  process.env.NODE_ENV === 'development'
    ? create<AppState>()(devtools(storeFn, { name: 'App Store' }))
    : create<AppState>()(storeFn)
