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
  get roles(): Map<string, ServerRole> {
    const result: Map<string, ServerRole> = new Map()
    for (const role in this.#server.roles) result.set(role, this.#server.roles[role]!)
    return result
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
    return this.#server.name
  }

  /**
   * Owner's user ID
   */
  get ownerId(): string {
    return this.#server.ownerId
  }

  /**
   * Default permissions
   */
  get defaultPermissions(): bigint {
    return this.#server.defaultPermissions
  }

  /**
   * All emojis tied to this server
   */
  get emojis(): Emoji[] {
    return this.#collection.client.emojis.filter(
      (emoji) => emoji.parent?.server !== undefined && emoji.parent.server.id === this.id
    )
  }

  /**
   * Get an ordered array of roles with their IDs attached.
   * The highest ranking roles will be first followed by lower
   * ranking roles. This is dictated by the "rank" property
   * which is smaller for higher priority roles.
   */
  get orderedRoles(): {
    name: string
    permissions: { a: bigint; d: bigint }
    colour?: string | undefined
    hoist?: boolean
    rank?: bigint
    id: string
  }[] {
    const roles = this.roles
    return roles
      ? [...roles.values()].sort((a, b) => {
        const rankA = a.rank || BigInt(0)
        const rankB = b.rank || BigInt(0)
        // Compare bigints and convert result to number
        if (rankA < rankB) return -1
        if (rankA > rankB) return 1
        return 0
      })
      : []
  }
}
