import { createContext, ReactNode, useContext, useEffect } from 'react'
import { Client } from 'chaty-client'

import { Message, Channel } from 'chaty-client/models'
import { useLifecycle, State } from '@/context/client'

type ChannelState = {
  messages: Message[]
  atStart: boolean
  atEnd: boolean
  scrollTop?: number
}

const CacheContext = createContext<{
  manage(channel: Channel, state: ChannelState): void
  unmanage(channel: Channel): ChannelState | void
} | null>(null)

/**
 * Persistent messages & channel state cache
 */
export function MessagesCache({ client, children }: { children: ReactNode; client: Client }) {
  const { lifecycle } = useLifecycle()
  const cache: Record<string, ChannelState> = {}

  /**
   * Handle incoming messages
   * @param message Message object
   */
  function onMessage(message: Message) {
    const entry = cache[message.channelId]
    if (entry?.atEnd) {
      entry.messages = [message, ...entry.messages].slice(0, 50)
    }
  }

  /**
   * Handle deleted messages
   */
  function onMessageDelete(message: { id: string; channelId: string }) {
    const entry = cache[message.channelId]
    if (entry) {
      entry.messages = entry.messages.filter((msg) => msg.id !== message.id)
    }
  }

  useEffect(() => {
    const msgCreate = client
      .on('messageCreate')
      .subscribe((messages) => messages.map((msg) => onMessage(msg)))

    const msgDelete = client
      .on('messageDelete')
      .subscribe((messages) =>
        messages.map((msg) => onMessageDelete({ id: msg.id, channelId: msg.channelId }))
      )

    return () => {
      msgCreate.unsubscribe()
      msgDelete.unsubscribe()
    }
  }, [])

  // clear the cache when we reconnect
  useEffect(() => {
    const subscribe = lifecycle.state$.subscribe((state) => {
      if (state === State.Disconnected) {
        for (const key of Object.keys(cache)) delete cache[key]
      }
    })

    return () => {
      subscribe.unsubscribe()
    }
  }, [])

  return (
    <CacheContext.Provider
      value={{
        unmanage: (chan) => {
          if (cache[chan.id]) {
            const currentState = cache[chan.id]
            delete cache[chan.id]
            return currentState
          }
        },
        manage: (chan, state) => {
          cache[chan.id] = state
        },
      }}>
      {children}
    </CacheContext.Provider>
  )
}

export function useMessageCache() {
  return useContext(CacheContext)
}
