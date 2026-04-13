import { type ServerCollection } from '../collections'

export class Server {
  readonly #collection: ServerCollection
  readonly id: string

  #synced: undefined | 'partial' | 'full'

  constructor(collection: ServerCollection, id: string) {
    this.#collection = collection
    this.id = id
  }

  get #server() {
    return this.#collection.getUnderlyingObject(this.id)
  }

  /**
   * Convert to string
   * @returns String
   */
  toString(): string {
    return `<%${this.id}>`
  }

  /**
   * Whether this object exists
   */
  get $exists(): boolean {
    return !!this.#server.id
  }

  /**
   * Reset member sync status
   */
  resetSyncStatus(): void {
    this.#synced = undefined
  }
}
