import { create, StateCreator } from 'zustand'
import { devtools } from 'zustand/middleware'

import { paramsFromPathname } from '@/lib/client'

/**
 * Static section IDs
 */
export enum LAYOUT_SECTIONS {
  PRIMARY_SIDEBAR = 'PRIMARY_SIDEBAR',
  MEMBER_SIDEBAR = 'MEMBER_SIDEBAR',
  MENTION_REPLY = 'MENTION_REPLY',
  MATURE = 'nsfw',
}

interface LayoutState {
  // State
  activeInterface: 'home' | 'discover' | string
  activePath: Record<string, string>
  openSections: Record<string, boolean>

  // Actions
  setActiveInterface: (interfaceId: string) => void
  setActivePath: (interfaceId: string, path: string) => void
  setOpenSection: (sectionId: string, value: boolean, defaultValue?: boolean) => void
  toggleSectionState: (sectionId: string, defaultValue?: boolean) => void
  /**
   * Set the state of a section
   * @param id Section ID
   * @param value New state value
   * @param defaultValue Default state value
   */
  getSectionState: (sectionId: string, defaultValue?: boolean) => boolean
  setLastActivePath: (pathname: string) => void
  getLastActivePath: () => string
  getLastActiveDiscoverPath: () => string
  getLastActiveServerPath: (serverId: string) => string
  hydrate: () => void
  clean: (input: Partial<LayoutState>) => LayoutState
}

const storeFn: StateCreator<LayoutState> = (set, get) => {
  const getDefaultState = () => ({
    activeInterface: 'home' as const,
    activePath: {
      home: '/',
      discover: '/discover/servers',
    },
    openSections: {},
  })

  return {
    ...getDefaultState(),

    hydrate: () => {
      // nothing needs to be done
    },

    clean: (input: Partial<LayoutState>): LayoutState => {
      const layout: LayoutState = { ...get(), ...input }

      if (typeof input.activeInterface === 'string') {
        layout.activeInterface = input.activeInterface
      }

      if (typeof input.activePath === 'object') {
        for (const interfaceId of Object.keys(input.activePath)) {
          if (typeof input.activePath[interfaceId] === 'string') {
            layout.activePath[interfaceId] = input.activePath[interfaceId]
          }
        }
      }

      if (typeof input.openSections === 'object') {
        for (const section of Object.keys(input.openSections)) {
          if (typeof input.openSections[section] === 'boolean') {
            layout.openSections[section] = input.openSections[section]
          }
        }
      }

      return layout
    },

    setActiveInterface: (interfaceId: string) => {
      set({ activeInterface: interfaceId })
    },

    setActivePath: (interfaceId: string, path: string) => {
      set((state) => ({
        activePath: {
          ...state.activePath,
          [interfaceId]: path,
        },
      }))
    },

    setOpenSection: (sectionId: string, value: boolean, defaultValue = false) => {
      set((state) => ({
        openSections: {
          ...state.openSections,
          [sectionId]: value === defaultValue ? undefined! : value,
        },
      }))
    },

    toggleSectionState: (sectionId: string, defaultValue?: boolean) => {
      const currentState = get().getSectionState(sectionId, defaultValue)
      get().setOpenSection(sectionId, !currentState, defaultValue)
    },

    getSectionState: (sectionId: string, defaultValue = false) => {
      return get().openSections[sectionId] ?? defaultValue
    },

    getLastActivePath: () => {
      const state = get()
      const section = state.activeInterface
      return state.activePath[section] ?? '/'
    },

    getLastActiveDiscoverPath: () => {
      return get().activePath['discover']
    },

    getLastActiveServerPath: (serverId: string) => {
      return get().activePath[serverId] ?? `/server/${serverId}`
    },

    setLastActivePath: (pathname: string) => {
      if (pathname.startsWith('/settings') || pathname.startsWith('/invite')) return

      const params = paramsFromPathname(pathname)
      const section = pathname.startsWith('/discover') ? 'discover' : (params.serverId ?? 'home')

      get().setActiveInterface(section)
      get().setActivePath(section, pathname)
    },
  }
}

export const useLayoutStore =
  process.env.NODE_ENV === 'development'
    ? create<LayoutState>()(devtools(storeFn, { name: 'Layout Store' }))
    : create<LayoutState>()(storeFn)
