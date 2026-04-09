import { BehaviorSubject } from 'rxjs'

import { hydrate, type Hydrators } from '../hydration'

/**
 * Wrapper around RxJS BehaviorSubject store
 */
export class ObjectStorage<T> {
  private store: Record<string, BehaviorSubject<T | undefined>>
  readonly set: (key: string, value: T | undefined) => void

  /**
   * Create new object storage
   */
  constructor() {
    this.store = {}
    this.set = (key: string, value: undefined | T) => {
      if (!this.store[key]) {
        this.store[key] = new BehaviorSubject<T | undefined>(value)
      } else {
        this.store[key].next(value) // Updates the value and notifies all listeners
      }
    }

    // To preserve this when the method is passed as a callback.
    //
    // const storage = new ObjectStorage();
    // const get = storage.get;  // Extracted method
    //
    // Without .bind(this):
    // get("id")  // ❌ 'this' is undefined (lost reference to storage)
    //
    // With .bind(this):
    // get("id")  // ✅ 'this' correctly points to storage
    //
    this.get = this.get.bind(this)
  }

  /**
   * Get object by ID (as Observable)
   * @param id ID
   * @returns Observable that emits when object changes
   */
  get$(id: string): BehaviorSubject<T | undefined> {
    if (!this.store[id]) this.store[id] = new BehaviorSubject<T | undefined>(undefined)
    return this.store[id]
  }

  /**
   * Get object by ID (current value)
   * @param id ID
   * @returns Object
   */
  get(id: string): T | undefined {
    return this.store[id]?.value
  }

  /**
   * Hydrate some data into storage
   * @param id ID
   * @param type Hydration type
   * @param context Context
   * @param data Input Data
   */
  hydrate(id: string, type: keyof Hydrators, context: unknown, data?: unknown) {
    if (data) {
      data = { partial: false, ...data }
      this.set(id, hydrate(type, data as never, context, true) as T)
    }
  }
}
