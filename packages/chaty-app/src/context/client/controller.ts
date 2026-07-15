import { BehaviorSubject, distinctUntilChanged, Observable, Subscription } from 'rxjs'

import { Client } from 'chaty-client'
import { ConnectionState, ProtocolV1 } from 'chaty-client/events'

import { Session, StoreType } from '@/state'
import { grpcClient } from '@/lib/client'

export enum State {
  Ready = 'Ready',
  LoggingIn = 'Logging In',
  Onboarding = 'Onboarding',
  Error = 'Error',
  Dispose = 'Dispose',
  Connecting = 'Connecting',
  Connected = 'Connected',
  Disconnected = 'Disconnected',
  Reconnecting = 'Reconnecting',
  Offline = 'Offline',
}

export enum TransitionType {
  LoginUncached = 'uncached login',
  LoginCached = 'cached login',
  SocketConnected = 'socket connected',
  DeviceOffline = 'device offline',
  DeviceOnline = 'device online',
  PermanentFailure = 'permanent failure',
  TemporaryFailure = 'temporary failure',
  UserCreated = 'user created',
  NoUser = 'no user',
  Cancel = 'cancel',
  Dispose = 'dispose',
  DisposeOnly = 'dispose only',
  Dismiss = 'dismiss',
  Ready = 'ready',
  Retry = 'retry',
  Logout = 'logout',
}

export type Transition =
  | {
    type: TransitionType.LoginUncached | TransitionType.LoginCached
    session: Session
  }
  | {
    type: TransitionType.PermanentFailure
    error: string
  }
  | {
    type:
    | TransitionType.NoUser
    | TransitionType.UserCreated
    | TransitionType.TemporaryFailure
    | TransitionType.SocketConnected
    | TransitionType.DeviceOffline
    | TransitionType.DeviceOnline
    | TransitionType.Cancel
    | TransitionType.Dismiss
    | TransitionType.Ready
    | TransitionType.Retry
    | TransitionType.Dispose
    | TransitionType.DisposeOnly
    | TransitionType.Logout
  }

type PolicyAttentionRequired = [ProtocolV1['types']['policyChange'][], () => Promise<void>]

class Lifecycle {
  #controller: ClientController
  client: Client

  #subscriptions = new Subscription()

  #stateSubject = new BehaviorSubject(State.Ready)
  #loadedOnceSubject = new BehaviorSubject(false)
  #policyAttentionRequiredSubject = new BehaviorSubject<undefined | PolicyAttentionRequired>(undefined)

  // Public Observables (read-only)
  readonly state$: Observable<State>
  readonly loadedOnce$: Observable<boolean>
  readonly policyAttentionRequired$: Observable<undefined | PolicyAttentionRequired>

  // Synchronous getters
  get state(): State {
    return this.#stateSubject.value
  }

  get loadedOnce(): boolean {
    return this.#loadedOnceSubject.value
  }

  get policyAttentionRequired(): undefined | PolicyAttentionRequired {
    return this.#policyAttentionRequiredSubject.value
  }

  get permanentError() {
    return this.#permanentError!
  }

  #connectionFailures = 0
  #permanentError: string | undefined
  #retryTimeout: NodeJS.Timeout | undefined

  constructor(controller: ClientController) {
    this.#controller = controller

    this.state$ = this.#stateSubject.asObservable().pipe(distinctUntilChanged())
    this.loadedOnce$ = this.#loadedOnceSubject.asObservable().pipe(distinctUntilChanged())
    this.policyAttentionRequired$ = this.#policyAttentionRequiredSubject.asObservable()

    this.onReady = this.onReady.bind(this)
    this.onPolicyChanges = this.onPolicyChanges.bind(this)
    this.onState = this.onState.bind(this)

    this.client = null!
    this.dispose()
  }

  private dispose() {
    if (this.client) {
      this.#subscriptions.unsubscribe()
      this.#subscriptions = new Subscription()
      this.client.events.disconnect()
    }

    this.client = new Client(grpcClient(), {
      baseURL: process.env.NEXT_PUBLIC_GRPC_ENDPOINT ?? '',
      autoReconnect: false,
      syncUnreads: true,
      debug: process.env.NODE_ENV === 'development',
    })

    this.client.configuration = {
      chatyVersion: '',
      app: String(),
      build: {} as never,
      features: {
        files: { enabled: true, url: '' },
        proxy: { enabled: true, url: '' },
        captcha: {} as never,
        email: true,
        inviteOnly: false,
        livekit: { enabled: false, nodes: [] },
      },
      vapid: String(),
      ws: process.env.NEXT_PUBLIC_WS_URL ?? '',
    }

    this.client = null!
    this.#subscriptions.add(this.client.events.on.state.subscribe(this.onState))
    this.#subscriptions.add(this.client.on('ready').subscribe(this.onReady))
    this.#subscriptions.add(
      this.client.on('policyChanges').subscribe(([changes, ack]) => this.onPolicyChanges(changes, ack))
    )
  }

  #enter(nextState: State) {
    if (process.env.NODE_ENV === 'development') console.info('[lifecycle] entering state', nextState)
    this.#stateSubject.next(nextState)

    if (this.#retryTimeout) {
      clearTimeout(this.#retryTimeout)
      this.#retryTimeout = undefined
    }

    switch (nextState) {
      case State.LoggingIn:
        // TODO: handle onboarding
        // if (onboarding) else this.client.connect()
        break
      case State.Connecting:
      case State.Reconnecting:
        this.client.connect()
        break
      case State.Connected:
        this.#controller.state.auth.getState().markValid()
        this.#loadedOnceSubject.next(true)
        this.#connectionFailures = 0
        break
      case State.Dispose:
        this.dispose()
        this.transition({ type: TransitionType.Ready })
        this.#loadedOnceSubject.next(false)
        break
      case State.Disconnected:
        this.#connectionFailures++
        if (!navigator.onLine) this.transition({ type: TransitionType.DeviceOffline })
        else {
          const retryIn = (Math.pow(2, this.#connectionFailures) - 1) * (0.8 + Math.random() * 0.4)
          console.info('Will try to reconnect in', retryIn.toFixed(2), 'seconds!')

          this.#retryTimeout = setTimeout(() => {
            this.#retryTimeout = undefined
            this.transition({ type: TransitionType.Retry })
          }, retryIn * 1e3)
        }
        break
    }
  }

  transition(trans: Transition) {
    console.debug('Received transition', trans.type)

    if (trans.type === TransitionType.DisposeOnly) {
      this.dispose()
      return
    }

    const state = this.state

    switch (state) {
      case State.Ready:
        if (trans.type === TransitionType.LoginUncached) {
          this.client.useExistingSession({ ...trans.session, user_id: trans.session.userId })
          this.#enter(State.LoggingIn)
        } else if (trans.type === TransitionType.LoginCached) {
          this.client.useExistingSession({ ...trans.session, user_id: trans.session.userId })
          this.#enter(State.Connecting)
          this.#enter(State.Connecting)
        }
        break

      case State.LoggingIn:
        switch (trans.type) {
          case TransitionType.SocketConnected:
            this.#enter(State.Connected)
            break
          case TransitionType.NoUser:
            this.#enter(State.Onboarding)
            break
          case TransitionType.PermanentFailure:
          case TransitionType.TemporaryFailure:
            // TODO: track the occurred error
            this.#enter(State.Error)
            break
        }
        break

      case State.Onboarding:
        if (trans.type === TransitionType.UserCreated) {
          this.#enter(State.Connecting)
        } else if (trans.type === TransitionType.Cancel) {
          this.#enter(State.Dispose)
        }
        break
      case State.Error:
        if (trans.type === TransitionType.Dismiss) {
          this.#enter(State.Dispose)
        }
        break
      case State.Dispose:
        if (trans.type === TransitionType.Ready) {
          this.#enter(State.Ready)
        }
        break
      case State.Connecting:
        switch (trans.type) {
          case TransitionType.SocketConnected:
            this.#enter(State.Connected)
            break
          case TransitionType.TemporaryFailure:
            this.#enter(State.Disconnected)
            break
          case TransitionType.PermanentFailure:
            this.#permanentError = trans.error
            this.#enter(State.Error)
            break
          case TransitionType.Logout:
            this.#enter(State.Dispose)
            break
        }
        break
      case State.Connected:
        switch (trans.type) {
          case TransitionType.TemporaryFailure:
            this.#enter(State.Disconnected)
            break
          case TransitionType.Logout:
            this.#enter(State.Dispose)
            break
        }
        break
      case State.Disconnected:
        switch (trans.type) {
          case TransitionType.DeviceOffline:
            this.#enter(State.Offline)
            break
          case TransitionType.Retry:
            this.#enter(State.Reconnecting)
            break
          case TransitionType.Logout:
            this.#enter(State.Dispose)
            break
        }
        break
      case State.Reconnecting:
        switch (trans.type) {
          case TransitionType.SocketConnected:
            this.#enter(State.Connected)
            break
          case TransitionType.TemporaryFailure:
            this.#enter(State.Disconnected)
            break
          case TransitionType.PermanentFailure:
            // TODO: relay error
            this.#enter(State.Error)
            break
          case TransitionType.Logout:
            this.#enter(State.Dispose)
            break
        }
        break

      case State.Offline:
        switch (trans.type) {
          case TransitionType.DeviceOnline:
            this.#enter(State.Reconnecting)
            break
          case TransitionType.Retry:
            this.#enter(State.Reconnecting)
            break
          case TransitionType.Logout:
            this.#enter(State.Dispose)
            break
        }
        break
    }

    if (state === this.state) {
      console.error('An unhandled transition occurred!', trans, 'was received on', state)
    }
  }

  private onReady() {
    this.transition({ type: TransitionType.SocketConnected })
  }

  private onPolicyChanges(changes: ProtocolV1['types']['policyChange'][], ack: () => Promise<void>) {
    this.#policyAttentionRequiredSubject.next([
      changes,
      () => ack().then(() => this.#policyAttentionRequiredSubject.next(undefined)),
    ])
  }

  private onState(state: ConnectionState) {
    switch (state) {
      case ConnectionState.Disconnected:
        if (this.client.events.lastError) {
          if (this.client.events.lastError.type === 'chaty') {
            this.transition({
              type: TransitionType.PermanentFailure,
              error: this.client.events.lastError.data.type,
            })
            break
          }
        }
        this.transition({ type: TransitionType.TemporaryFailure })
        break
    }
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.#subscriptions.unsubscribe()
    this.#stateSubject.complete()
    this.#loadedOnceSubject.complete()
    this.#policyAttentionRequiredSubject.complete()
    clearTimeout(this.#retryTimeout)
  }
}

export default class ClientController {
  readonly state: StoreType
  readonly lifecycle: Lifecycle

  constructor(state: StoreType) {
    this.state = state

    this.lifecycle = new Lifecycle(this)
    const session = state.auth.getState().session
    if (session) this.lifecycle.transition({ type: TransitionType.LoginCached, session })

    this.isLoggedIn = this.isLoggedIn.bind(this)
    this.isError = this.isError.bind(this)
  }

  getCurrentClient() {
    return this.lifecycle.client
  }

  isLoggedIn() {
    return [
      State.Connecting,
      State.Connected,
      State.Disconnected,
      State.Offline,
      State.Reconnecting,
    ].includes(this.lifecycle.state)
  }

  isError() {
    return this.lifecycle.state === State.Error
  }

  dispose() {
    this.lifecycle.transition({
      type: TransitionType.DisposeOnly,
    })
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.lifecycle.destroy()
  }
}
