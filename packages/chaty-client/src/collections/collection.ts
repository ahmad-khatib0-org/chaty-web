import { BehaviorSubject, map, Observable } from 'rxjs'

import { ObjectStorage } from './object-storage'
import type { Hydrators } from '../hydration'
import type { Client } from '../client'

/**
 * Abstract Collections type
 */
export abstract class Collection<T> {
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
export abstract class StoreCollection<T, V> extends Collection<T> {
  #storage = new ObjectStorage<V>()
  #objects = new Map<string, T>()
  #subjects = new Map<string, BehaviorSubject<T | undefined>>(new Map())
  #collectionSubject = new BehaviorSubject<Map<string, T>>(new Map())

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
    let subject = this.#subjects.get(id)
    if (!subject) {
      subject = new BehaviorSubject<T | undefined>(undefined)
      this.#subjects.set(id, subject)
    }
    return subject.asObservable()
  }

  /**
   * Get an existing object (current value)
   * @param id Id
   * @returns Object or undefined
   */
  get(id: string): T | undefined {
    return this.#objects.get(id)
  }

  /**
   * Get observable of all objects
   * @returns Observable that emits the entire map when any change occurs
   */
  getAll$(): Observable<Map<string, T>> {
    return this.#collectionSubject.asObservable()
  }

  /**
   * Get observable of all values as an array
   * @returns Observable that emits array of all objects when changes occur
   */
  getValues$(): Observable<T[]> {
    return this.#collectionSubject.asObservable().pipe(map((m) => Array.from(m.values())))
  }

  /**
   * Get observable of collection size
   * @returns Observable that emits size when changes occur
   */
  getSize$(): Observable<number> {
    return this.#collectionSubject.asObservable().pipe(map((map) => map.size))
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
    const subject = this.#subjects.get(id)
    if (subject) {
      subject.complete()
      this.#subjects.delete(id)
    }

    this.#objects.delete(id)
    this.updateUnderlyingObject(id, undefined as never)
    this.#collectionSubject.next(new Map(this.#objects))
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
    this.#objects.set(id, instance)

    // Update the individual subject
    let subject = this.#subjects.get(id)
    if (!subject) {
      subject = new BehaviorSubject<T | undefined>(instance)
      this.#subjects.set(id, subject)
    } else {
      subject.next(instance)
    }

    // Update the collection subject
    this.#collectionSubject.next(new Map(this.#objects))
  }

  /**
   * Update an existing object
   * @param id Id
   * @param newValue New value
   */
  update(id: string, newValue: T): void {
    if (this.#objects.has(id)) {
      this.#objects.set(id, newValue)
      const subject = this.#subjects.get(id)
      if (subject) subject.next(newValue)
      this.#collectionSubject.next(new Map(this.#objects))
    }
  }

  /**
   * Check whether an object is partially defined
   * @param id Id
   * @returns Whether it is a partial
   */
  isPartial(id: string): boolean {
    return !!(this.getUnderlyingObject(id) as { partial: boolean }).partial
  }

  /**
   * Number of stored objects (synchronous)
   * @returns Size
   */
  size(): number {
    return this.#objects.size
  }

  /**
   * Iterable of keys in the map
   * @returns Iterable
   */
  keys(): IterableIterator<string> {
    return this.#objects.keys()
  }

  /**
   * Iterable of values in the map
   * @returns Iterable
   */
  values(): IterableIterator<T> {
    return this.#objects.values()
  }

  /**
   * Iterable of key, value pairs in the map
   * @returns Iterable
   */
  entries(): IterableIterator<[string, T]> {
    return this.#objects.entries()
  }

  /**
   * Execute a provided function over each key, value pair in the map
   * @param cb Callback for each pair
   */
  forEach(cb: (value: T, key: string, map: Map<string, T>) => void): void {
    return this.#objects.forEach(cb)
  }

  /**
   * Clean up all subscriptions
   */
  destroy(): void {
    for (const subject of this.#subjects.values()) {
      subject.complete()
    }
    this.#subjects.clear()
    this.#collectionSubject.complete()
  }
}

/**
 * Generic class collection backed by store
 */
export class ClassCollection<T, V> extends StoreCollection<T, V> {
  readonly client: Client

  /**
   * Create generic class collection
   * @param client Client
   */
  constructor(client: Client) {
    super()
    this.client = client
  }
}
