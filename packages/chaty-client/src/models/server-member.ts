import type { Role } from '@chaty-app/proto/web-plain/service/v1/roles_db'

import type { ServerMemberCollection } from '../collections'
import type { Server } from './server'
import type { User } from './user'
import type { File } from './file'
import type { Channel } from './channel'
import { Permission } from '../permissions'
import { bitwiseAndEq, calculatePermission } from '../permissions/calculation'

/**
 * Deterministic conversion of member composite key to string ID
 * @param key Key
 * @returns String key
 */
function key(key: MemberCompositeKey): string {
  return key.server + key.user
}

export type MemberCompositeKey = {
  server: string
  user: string
}

/**
 * Server Member Class
 */
export class ServerMember {
  readonly #collection: ServerMemberCollection
  readonly id: MemberCompositeKey

  /**
   * Construct Server Member
   * @param collection Collection
   * @param id Id
   */
  constructor(collection: ServerMemberCollection, id: MemberCompositeKey) {
    this.#collection = collection
    this.id = id
  }

  /**
   * Convert to string
   * @returns String
   */
  toString(): string {
    return `<@${this.id.user}>`
  }

  /**
   * Whether this object exists
   */
  get $exists(): boolean {
    return !this.#collection.getUnderlyingObject(key(this.id)).id
  }

  get serverMember() {
    return this.#collection.getUnderlyingObject(key(this.id))
  }

  /**
   * Server this member belongs to
   */
  get server(): Server | undefined {
    return this.#collection.client.servers.get(this.id.server)
  }

  /**
   * User corresponding to this member
   */
  get user(): User | undefined {
    return this.#collection.client.users.get(this.id.user)
  }

  /**
   * List of role IDs
   */
  get roles(): string[] {
    return this.serverMember.roles
  }

  /**
   * Member's current role colour.
   */
  get roleColour(): string | undefined {
    const roles = this.orderedRoles.filter((role) => role.colour)
    if (roles.length > 0) return roles[roles.length - 1]?.colour
    else return undefined
  }

  /**
   * Ordered list of roles for this member, from lowest to highest priority.
   */
  get orderedRoles(): (Partial<Omit<Role, 'permissions'> & { permissions: { a: bigint; d: bigint } }> & {
    id: string
  })[] {
    return (
      this.roles
        .map((id) => {
          const role = this.server?.roles.get(id)
          const result: any = { id, ...role }

          // Only add rank if it exists (don't add undefined)
          if (role?.rank !== undefined) {
            result.rank = BigInt(role.rank)
          }

          return result
        })
        .sort((a, b) => (b.rank ?? 0n) - (a.rank ?? 0n)) ?? []
    )
  }

  /**
   * Nickname
   */
  get nickname(): string | undefined {
    return this.serverMember.nickname
  }

  /**
   * Avatar
   */
  get avatar(): File | undefined {
    return this.serverMember.avatar
  }

  /**
   * Time at which timeout expires
   */
  get timeout(): bigint | undefined {
    return this.serverMember.timeout
  }

  /**
   * URL to the member's avatar
   */
  get avatarURL(): string | undefined {
    return this.avatar?.createFileURL() ?? this.user?.avatarURL
  }

  /**
   * Display name
   */
  get displayName(): string | undefined {
    return this.nickname ?? this.user?.displayName
  }

  /**
   * URL to the member's animated avatar
   */
  get animatedAvatarURL(): string | undefined {
    return this.avatar?.createFileURL() ?? this.user?.animatedAvatarURL
  }

  /**
   * Get the permissions that this member has against a certain object
   * @param target Target object to check permissions against
   * @returns Permissions that this member has
   */
  getPermissions(target: Server | Channel): bigint {
    return calculatePermission(this.#collection.client, target, { member: this })
  }

  /**
   * Check whether a member has a certain permission against a certain object
   * @param target Target object to check permissions against
   * @param permission Permission names to check for
   * @returns Whether the member has this permission
   */
  hasPermission(target: Server | Channel, ...permission: (keyof typeof Permission)[]): boolean {
    return bitwiseAndEq(this.getPermissions(target), ...permission.map((x) => Permission[x]))
  }
}
