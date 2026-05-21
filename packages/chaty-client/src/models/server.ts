import { type ServerCollection } from '../collections'
import type { Emoji } from './emoji'
import type { File } from './file'
import type { ServerMember } from './server-member'
import type { ServerRole } from './server-role'

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

  /**
   * Roles
   */
  get roles(): Record<string, ServerRole> {
    return this.#collection.getUnderlyingObject(this.id).roles
  }

  /**
   * Own member object for this server
   */
  get member(): ServerMember | undefined {
    return this.#collection.client.serverMembers.getByKey({
      server: this.id,
      user: this.#collection.client.user!.id,
    })
  }

  /**
   * Icon
   */
  get icon(): File | undefined {
    return this.#collection.getUnderlyingObject(this.id).icon
  }

  /**
   * URL to the server's icon
   */
  get iconURL(): string | undefined {
    return this.icon?.createFileURL()
  }

  /**
   * Name
   */
  get name(): string {
    return this.#collection.getUnderlyingObject(this.id).name
  }

  /**
   * All emojis tied to this server
   */
  get emojis(): Emoji[] {
    return this.#collection.client.emojis.filter(
      (emoji) => emoji.parent?.server !== undefined && emoji.parent.server.id === this.id
    )
  }
}
