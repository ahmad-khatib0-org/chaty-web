import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useContext,
} from 'react'

import { ACTION_PRIORITY, KeybindAction, keybindFilter } from './keybind-actions'
import { DEFAULT_MAC_SEQUENCES, DEFAULT_SEQUENCES } from './keybind-sequences'

type KeybindContextType = {
  createKeybind: (keybind: KeybindAction, callback: () => void) => void
}

const keybindContext = createContext<KeybindContextType | null>(null)

// Custom hook to track active keys
const useActiveKeys = () => {
  const [activeKeys, setActiveKeys] = useState(new Set<string>())

  const addKey = useCallback((key: string) => {
    setActiveKeys((prev) => new Set(prev).add(key))
  }, [])

  const deleteKey = useCallback((key: string) => {
    setActiveKeys((prev) => {
      const newSet = new Set(prev)
      newSet.delete(key)
      return newSet
    })
  }, [])

  return { addKey, deleteKey, activeKeys }
}

export function KeybindContext({ children }: { children: ReactNode }) {
  const targetRef = useRef<HTMLElement | null>(null)
  const { activeKeys, deleteKey, addKey } = useActiveKeys()

  /**
   * Keep track of which keybinds are currently bound
   * to filter the firing keybindings list
   */
  const currentlyBound = useRef(
    ACTION_PRIORITY.reduce((d, k) => ({ ...d, [k]: 0 }), {} as Record<KeybindAction, number>)
  )

  const callbacksRef = useRef<Partial<Record<KeybindAction, (() => void)[]>>>({})

  const sequences = navigator.platform.startsWith('Mac') ? DEFAULT_MAC_SEQUENCES : DEFAULT_SEQUENCES

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const logActiveKeys = () => {
        const activeKeysArray = Array.from(activeKeys)
        const firingInfo = ACTION_PRIORITY.filter((keybind) => currentlyBound.current[keybind])
          .filter((keybind) => keybindFilter(keybind, activeKeys, currentlyBound.current, targetRef.current))
          .reduce(
            (d, keybind) => ({
              ...d,
              [keybind]: sequences[keybind].every((key) =>
                key instanceof RegExp
                  ? activeKeysArray.some((item) => key.test(item))
                  : activeKeysArray.includes(key)
              ),
            }),
            {}
          )

        console.debug('[keybinds] Currently pressing', activeKeysArray, 'which selects', firingInfo)
      }

      logActiveKeys()
    }
  }, [activeKeys, sequences])

  // Get the currently firing keybind
  const getFiringKeybind = useCallback(() => {
    const activeKeysArray = Array.from(activeKeys)

    return (
      ACTION_PRIORITY.filter((keybind) => currentlyBound.current[keybind])
        .filter((keybind) => keybindFilter(keybind, activeKeys, currentlyBound.current, targetRef.current))
        .filter((keybind) =>
          sequences[keybind].every((key) =>
            key instanceof RegExp
              ? activeKeysArray.some((item) => key.test(item))
              : activeKeysArray.includes(key)
          )
        )
        // return the highest priority keybind
        .shift()
    )
  }, [activeKeys, sequences])

  const createKeybind = useCallback((keybind: KeybindAction, callback: () => void) => {
    currentlyBound.current[keybind]++

    // Store callback
    if (!callbacksRef.current[keybind]) {
      callbacksRef.current[keybind] = []
    }
    callbacksRef.current[keybind].push(callback)

    return () => {
      currentlyBound.current[keybind]--
      if (callbacksRef.current[keybind]) {
        callbacksRef.current[keybind] = callbacksRef.current[keybind].filter((cb) => cb !== callback)
        if (callbacksRef.current[keybind].length === 0) {
          delete callbacksRef.current[keybind]
        }
      }
    }
  }, [])

  // Global effect to trigger ALL callbacks
  useEffect(() => {
    const firingKeybind = getFiringKeybind()
    if (firingKeybind && callbacksRef.current[firingKeybind]) {
      callbacksRef.current[firingKeybind].forEach((cb) => cb())
    }
  }, [activeKeys, getFiringKeybind])

  // Handle key down event
  const onKeyDown = useCallback(
    (event: KeyboardEvent) => {
      targetRef.current = event.target as HTMLElement
      addKey(event.key)
    },
    [addKey]
  )

  // Handle key up event
  const onKeyUp = useCallback(
    (event: KeyboardEvent) => {
      targetRef.current = event.target as HTMLElement
      deleteKey(event.key)
    },
    [deleteKey]
  )

  useEffect(() => {
    // keydown - Fires when a key is pressed down
    document.body.addEventListener('keydown', onKeyDown)
    // keyup - Fires when a key is released
    document.body.addEventListener('keyup', onKeyUp)

    // so in current context:
    // keydown adds the pressed key to activeKeys Set
    // keyup removes the released key from activeKeys Set
    // This allows tracking which keys are currently being held down to
    //   detect key combinations (like Ctrl + K).

    return () => {
      document.body.removeEventListener('keydown', onKeyDown)
      document.body.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  const contextValue = useMemo(() => ({ createKeybind }), [createKeybind])

  return <keybindContext.Provider value={contextValue}>{children}</keybindContext.Provider>
}

// Hook for creating keybinds
export function useKeybind(keybind: KeybindAction, callback: () => void) {
  const context = useContext(keybindContext)

  useEffect(() => {
    if (!context) return

    const cleanup = context.createKeybind(keybind, callback)
    return cleanup
  }, [context, keybind, callback])
}

// Declarative Keybind component
export function Keybind({ keybind, onPressed }: { keybind: KeybindAction; onPressed: () => void }) {
  useKeybind(keybind, onPressed)
  return null
}
