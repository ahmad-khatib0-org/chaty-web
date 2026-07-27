import { createStore } from 'zustand'
import { filter, Observable, Subject, Subscription, takeUntil, timer } from 'rxjs'
import { JSONParse, JSONStringify } from 'json-with-bigint'

import type { ProtocolV1 } from './v1'

/**
 * Available protocols to connect with
 */
export type AvailableProtocols = 1

/**
 * Protocol mapping
 */
type Protocols = {
  1: ProtocolV1
}

/**
 * Select a protocol by its key
 */
export type EventProtocol<T extends AvailableProtocols> = Protocols[T]

/**
 * All possible event client states.
 */
export enum ConnectionState {
  Idle,
  Connecting,
  Connected,
  Disconnected,
}

export interface EventClientOptions {
  /**
   * Whether to log events
   * @default false
   */
  debug: boolean

  /**
   * Time in seconds between Ping packets sent to the server
   * @default 30
   */
  heartbeatInterval: number

  /**
   * Maximum time in seconds between Ping and corresponding Pong
   * @default 10
   */
  pongTimeout: number

  /**
   * Maximum time in seconds between init and first message
   * @default 10
   */
  connectTimeout: number
}

interface ClientState {
  ping: number
  connectionState: ConnectionState
  lastError: { type: 'socket'; data: any } | { type: 'chaty'; data: any } | undefined
}

const initialState: ClientState = {
  ping: -1,
  connectionState: ConnectionState.Idle,
  lastError: undefined,
}

/**
 * Events provided by the client.
 */
type Event<T extends AvailableProtocols, P extends EventProtocol<T>> = {
  error: [error: any]
  event: [event: P['server']]
  state: [state: ConnectionState]
}

/**
 * Simple wrapper around the Chaty websocket service.
 */
export class EventClient<T extends AvailableProtocols> {
  readonly options: EventClientOptions
  #protocolVersion: T
  #transportFormat: 'json' | 'msgpack'

  readonly store = createStore<ClientState>(() => initialState)

  private eventsSubject = new Subject<EventProtocol<T>['server']>()
  private errorSubject = new Subject<any>()
  private socketSubject = new Subject<WebSocket>()
  private disconnectSubject = new Subject<void>()

  readonly on = {
    event: this.eventsSubject.asObservable(),
    error: this.errorSubject.asObservable(),
    state: new Observable<ConnectionState>((sub) => {
      return this.store.subscribe((state) => sub.next(state.connectionState))
    }),
    ping: new Observable<number>((sub) => {
      return this.store.subscribe((state) => sub.next(state.ping))
    }),
  } as const

  readonly events$: Observable<EventProtocol<T>['server']> = this.eventsSubject.asObservable()

  readonly event$ = <K extends EventProtocol<T>['server']['type']>(
    type: K
  ): Observable<Extract<EventProtocol<T>['server'], { type: K }>> =>
    this.events$.pipe(filter((e): e is any => e.type === type))

  #socket: WebSocket | undefined
  #subscriptions: Subscription[] = []

  constructor(protocolVersion: T, transportFormat: 'json' = 'json', options?: Partial<EventClientOptions>) {
    this.#protocolVersion = protocolVersion
    this.#transportFormat = transportFormat

    this.options = {
      heartbeatInterval: 30,
      pongTimeout: 10,
      connectTimeout: 10,
      debug: options?.debug ?? false,
      ...options,
    }

    // TODO: add it again when you setup the ws on the backend
    // this.setupHeartbeat()
  }

  private setupHeartbeat(): void {
    const heartbeat$ = timer(
      this.options.heartbeatInterval * 1000,
      this.options.heartbeatInterval * 1000
    ).pipe(takeUntil(this.disconnectSubject))

    this.#subscriptions.push(
      heartbeat$.subscribe(() => {
        this.send({ type: 'Ping', data: Date.now() })
        setTimeout(() => this.disconnect(), this.options.pongTimeout * 1000)
      })
    )
  }

  send(event: EventProtocol<T>['client']): void {
    if (this.options.debug) console.debug('[C->S]', event)
    if (!this.#socket) throw new Error('Socket is closed')
    this.#socket.send(JSONStringify(event))
  }

  private updateState(updater: Partial<ClientState> | ((state: ClientState) => ClientState)): void {
    this.store.setState(updater)
  }

  connect(uri: string, token: string): void {
    this.disconnect()
    this.updateState({ lastError: undefined, connectionState: ConnectionState.Connecting })

    setTimeout(() => {
      if (this.store.getState().connectionState === ConnectionState.Connecting) {
        this.disconnect()
      }
    }, this.options.connectTimeout * 1000)

    const url = new URL(uri)
    url.searchParams.set('version', this.#protocolVersion.toString())
    url.searchParams.set('format', this.#transportFormat)
    url.searchParams.set('token', token)

    this.#socket = new WebSocket(url)
    this.socketSubject.next(this.#socket)

    this.#socket.onopen = () => {
      if (this.options.debug) console.log('socket opened')
      // Heartbeat already handled
    }

    this.#socket.onerror = (error) => {
      this.updateState({ lastError: { type: 'socket', data: error } })
      this.errorSubject.next(error as any)
    }

    this.#socket.onmessage = (msg) => {
      if (this.#transportFormat === 'json' && typeof msg.data === 'string') {
        this.handle(JSONParse(msg.data))
      }
    }

    this.#socket.onclose = () => {
      this.#socket = undefined
      this.updateState({ connectionState: ConnectionState.Disconnected })
      this.disconnectSubject.next()
    }
  }

  disconnect() {
    if (!this.#socket) return
    this.#socket.close()
    this.#socket = undefined
    this.disconnectSubject.next()
  }

  private handle(event: EventProtocol<T>['server']): void {
    if (this.options.debug) console.debug('[S->C]', event)

    switch (event.type) {
      case 'Ping':
        this.send({ type: 'Pong', data: event.data } as any)
        return
      case 'Pong':
        const ping = Date.now() - event.data
        this.updateState({ ping })
        if (this.options.debug) console.debug(`[ping] ${ping}ms`)
        return
      case 'Error':
        this.updateState({ lastError: { type: 'chaty', data: event.data } })
        this.errorSubject.next(event.data as any)
        this.disconnect()
        return
    }

    const currentState = this.store.getState().connectionState
    switch (currentState) {
      case ConnectionState.Connecting:
        if (event.type === 'Ready') {
          this.eventsSubject.next(event)
          this.updateState({ connectionState: ConnectionState.Connecting })
        }
        break
      case ConnectionState.Connected:
        if (event.type !== 'Authenticated' && event.type !== 'Ready') {
          this.eventsSubject.next(event)
        }
        break
    }
  }

  get lastError(): ClientState['lastError'] {
    return this.store.getState().lastError
  }

  destroy(): void {
    this.#subscriptions.forEach((sub) => sub.unsubscribe)
    this.disconnect()
    this.eventsSubject.complete()
    this.errorSubject.complete()
    this.socketSubject.complete()
    this.disconnectSubject.complete()
  }
}
