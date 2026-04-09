import { BehaviorSubject, Observable } from 'rxjs'

import { ObjectStorage } from './object-storage'
import type { Hydrators } from '../hydration'

/**
 * Abstract Operations type
 */
export abstract class Operation<T> {
  /**
   * Get an existing object
   * @param id Id
   * @returns Object
   */
  abstract get(id: string): T | undefined

  /**
   * Check whether an id exists in the Collection
   * @param id Id
   * @returns Whether it exists
   */
  abstract has(id: string): boolean

  /**
   * Delete an object
   * @param id Id
   */
  abstract delete(id: string): void

  /**
   * Number of stored objects
   * @returns Size
   */
  abstract size(): number

  /**
   * Iterable of keys in the map
   * @returns Iterable
   */
  abstract keys(): IterableIterator<string>

  /**
   * Iterable of values in the map
   * @returns Iterable
   */
  abstract values(): IterableIterator<T>

  /**
   * Iterable of key, value pairs in the map
   * @returns Iterable
   */
  abstract entries(): IterableIterator<[string, T]>

  /**
   * Execute a provided function over each key, value pair in the map
   * @param cb Callback for each pair
   */
  abstract forEach(cb: (value: T, key: string, map: Map<string, T>) => void): void

  /**
   * List of values in the map
   * @returns List
   */
  toList(): T[] {
    return [...this.values()]
  }

  /**
   * Filter the collection by a given predicate
   * @param predicate Predicate to satisfy
   */
  filter(predicate: (value: T, key: string) => boolean): T[] {
    const list: T[] = []
    for (const [key, value] of this.entries()) {
      if (predicate(value, key)) {
        list.push(value)
      }
    }

    return list
  }

  /**
   * Map the collection using a given callback
   * @param cb Callback
   */
  map<O>(cb: (value: T, key: string) => O): O[] {
    const list: O[] = []
    for (const [key, value] of this.entries()) {
      list.push(cb(value, key))
    }
    return list
  }

  /**
   * Find some value based on a predicate
   * @param predicate Predicate to satisfy
   */
  find(predicate: (value: T, key: string) => boolean): T | undefined {
    for (const [key, value] of this.entries()) {
      if (predicate(value, key)) {
        return value
      }
    }
  }
}

/**
 * Collection backed by RxJS BehaviorSubject
 */
export abstract class StoreOperation<T, V> extends Operation<T> {
  #storage = new ObjectStorage<V>()
  #objects = new Map<string, BehaviorSubject<T | undefined>>()
  #objectsSubject = new BehaviorSubject<Map<string, BehaviorSubject<T | undefined>>>(new Map())

  readonly getUnderlyingObject: (id: string) => V
  readonly updateUnderlyingObject: (key: string, value: V | undefined) => void

  constructor() {
    super()
    this.getUnderlyingObject = (key) => this.#storage.get(key) ?? ({} as V)
    this.updateUnderlyingObject = (key, value) => this.#storage.set(key, value)
  }

  /**
   * Get an existing object as Observable
   * @param id Id
   * @returns Observable that emits when object changes
   */
  get$(id: string): Observable<T | undefined> {
    let subject = this.#objects.get(id)
    if (!subject) {
      subject = new BehaviorSubject<T | undefined>(undefined)
      this.#objects.set(id, subject)
      this.#objectsSubject.next(this.#objects)
    }
    return subject.asObservable()
  }

  /**
   * Get an existing object (current value)
   * @param id Id
   * @returns Object or undefined
   */
  get(id: string): T | undefined {
    return this.#objects.get(id)?.value
  }

  /**
   * Check whether an id exists in the Collection
   * @param id Id
   * @returns Whether it exists
   */
  has(id: string): boolean {
    return this.#objects.has(id)
  }

  /**
   * Delete an object
   * @param id Id
   */
  delete(id: string): void {
    const subject = this.#objects.get(id)
    if (subject) {
      subject.complete()
      this.#objects.delete(id)
      this.updateUnderlyingObject(id, undefined)
      this.#objectsSubject.next(this.#objects)
    }
  }

  /**
   * Create a new instance of an object
   * @param id Id
   * @param type Type
   * @param instance Instance
   * @param context Context
   * @param data Data
   */
  create(id: string, type: keyof Hydrators, instance: T, context: unknown, data?: unknown): void {
    this.#storage.hydrate(id, type, context, data)
  }
}
