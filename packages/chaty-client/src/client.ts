import { BehaviorSubject, Observable, share, Subject, Subscription } from 'rxjs'

import type { Channel } from '@chaty-app/proto/web-plain/service/v1/channels_db'
import type { ChatyConfig } from '@chaty-app/proto/web-plain/service/v1/config'

import { ConnectionState, EventClient, type EventClientOptions } from './events/event_client'
import { handleEvent, type ProtocolV1 } from './events/v1'
import {
  ChannelCollection,
  EmojiCollection,
  ServerCollection,
  UserCollection,
  ServerMemberCollection,
  MessageCollection,
} from './collections'
import { Message, User } from './models'
import type { HydratedMessage } from './hydration'

export type Session = { id: string; token: string; user_id: string } | string

export type Events = {
  error: [error: any]
  connected: []
  connecting: []
  disconnected: []
  ready: []
  logout: []

  policyChanges: [policyChanges: ProtocolV1['types']['policyChange'][], acknowledge: () => Promise<void>]

  messageCreate: [message: Message]
  messageDelete: [message: HydratedMessage]
}

/**
 * Client options object
 */
export type ClientOptions = Partial<EventClientOptions> & {
  /**
   * Base URL of the API server
   */
  baseURL: string

  /**
   * Whether to allow partial objects to emit from events
   * @default false
   */
  partials: boolean

  /**
   * Whether to automatically sync unreads information
   * @default false
   */
  syncUnreads: boolean

  /**
   * Whether to reconnect when disconnected
   * @default true
   */
  autoReconnect: boolean

  /**
   * Retry delay function
   * @param retryCount Count
   * @returns Delay in seconds
   * @default (2^x-1) ±20%
   */
  retryDelayFunction(retryCount: number): number

  /**
   * Check whether a channel is muted
   * @param channel Channel
   * @return Whether it is muted or through inheritance
   * @default false
   */
  channelIsMuted(channel: Channel): boolean

  /**
   * Check whether a channel is exclusively muted (irrespective of server)
   * @param channel Channel
   * @return Whether it is exclusively muted
   * @default false
   */
  channelExclusiveMuted(channel: Channel): boolean
}

/**
 * Chaty Clients
 */
export class Client {
  // readonly bots
  readonly servers
  readonly users
  readonly serverMembers
  readonly channels
  readonly emojis
  readonly messages

  readonly options: ClientOptions
  readonly events: EventClient<1>

  configuration: ChatyConfig | undefined
  #session: Session | undefined

  #userSubject = new BehaviorSubject<User | undefined>(undefined)

  #readySubject = new BehaviorSubject<boolean>(false)
  #connectionFailureCountSubject = new BehaviorSubject<number>(0)

  #events = new Map<keyof Events, Subject<any>>()

  #reconnectTimeout: number | undefined
  #subscriptions = new Subscription()

  readonly user$: Observable<User | undefined>
  readonly ready$: Observable<boolean>
  readonly connectionFailureCount$: Observable<number>

  // Public accessors for synchronous access
  get user(): User | undefined {
    return this.#userSubject.value
  }

  get ready(): boolean {
    return this.#readySubject.value
  }

  get connectionFailureCount(): number {
    return this.#connectionFailureCountSubject.value
  }

  constructor(options?: Partial<ClientOptions>, configuration?: ChatyConfig) {
    this.options = {
      baseURL: 'https://stoat.chat/api',
      partials: false,
      syncUnreads: false,
      autoReconnect: true,
      /**
       * Retry delay function
       * @param retryCount Count
       * @returns Delay in seconds
       */
      retryDelayFunction(retryCount) {
        return (Math.pow(2, retryCount), -1) * (0.8 + Math.random() * 0.4)
      },

      channelIsMuted() {
        return false
      },

      /**
       * Check whether a channel is exclusively muted (irrespective of server)
       * @param channel Channel
       * @return Whether it is exclusively muted
       * @default false
       */
      channelExclusiveMuted() {
        return false
      },
      ...options,
    }

    this.configuration = configuration
    this.events = new EventClient(1, 'json', this.options)

    this.user$ = this.#userSubject.asObservable()
    this.ready$ = this.#readySubject.asObservable()
    this.connectionFailureCount$ = this.#connectionFailureCountSubject.asObservable()

    this.servers = new ServerCollection(this)
    this.users = new UserCollection(this)
    this.serverMembers = new ServerMemberCollection(this)
    this.channels = new ChannelCollection(this)
    this.emojis = new EmojiCollection(this)
    this.messages = new MessageCollection(this)

    this.#subscriptions.add(this.events.on.error.subscribe((err) => this.emit('error', err)))
    this.#subscriptions.add(
      this.events.on.state.subscribe((state) => {
        switch (state) {
          case ConnectionState.Connected:
            this.servers.forEach((server) => server.resetSyncStatus())
            this.#connectionFailureCountSubject.next(0)
            this.emit('connected')
            break
          case ConnectionState.Connecting:
            this.emit('connecting')
            break
          case ConnectionState.Disconnected:
            this.emit('disconnected')
            if (this.options.autoReconnect) {
              this.#reconnectTimeout = setTimeout(
                () => this.connect(),
                this.options.retryDelayFunction(this.connectionFailureCount) * 1e3
              ) as never

              this.#connectionFailureCountSubject.next(this.connectionFailureCount + 1)
            }
            break
        }
      })
    )

    this.events.on.event.subscribe((event) => handleEvent(event))
  }

  /**
   * Subscribe to an event
   * @param event Event name
   * @returns Observable that emits when event occurs
   */
  on<K extends keyof Events>(event: K): Observable<Events[K]> {
    let subject = this.#events.get(event)
    if (!subject) {
      subject = new Subject<Events[K]>()
      this.#events.set(event, subject)
    }

    return subject.asObservable().pipe(share())
  }

  /**
   * Emit an event
   */
  emit<K extends keyof Events>(event: K, data?: Events[K]): void {
    const subject = this.#events.get(event)
    if (subject) subject.next(data)
  }

  /**
   * Current session id
   */
  get sessionId(): string | undefined {
    return typeof this.#session === 'string' ? undefined : this.#session?.id
  }

  /**
   * Get authentication header
   */
  get authenticationHeader(): [string, string] {
    return typeof this.#session === 'string'
      ? ['X-Bot-Token', this.#session]
      : ['X-Session-Token', this.#session?.token as string]
  }

  connect(): void {
    clearTimeout(this.#reconnectTimeout)
    this.events.disconnect()
    this.#readySubject.next(false)
    this.events.connect(
      this.configuration?.ws ?? 'wss://chaty.com/events',
      typeof this.#session === 'string' ? this.#session : this.#session!.token
    )
  }

  /**
   * Clean up resources
   */
  destroy() {
    this.#subscriptions.unsubscribe()
    this.#userSubject.complete()
    this.#readySubject.complete()
    this.#connectionFailureCountSubject.complete()

    for (const subject of this.#events.values()) {
      subject.complete()
    }

    this.#events.clear()
    clearTimeout(this.#reconnectTimeout)
    this.events.disconnect()
  }

  /**
   * Use an existing session
   */
  useExistingSession(session: Session): void {
    this.#session = session
  }

  /**
   * Proxy a file through proxy.
   * @param url URL to proxy
   * @returns Proxied media URL
   */
  proxyFile(url: string): string {
    if (this.configuration?.features?.proxy?.enabled) {
      return `${this.configuration.features.proxy.url}/proxy?url=${encodeURIComponent(url)}`
    } else {
      return url
    }
  }
}
