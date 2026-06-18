import type { UserCollection } from '../collections'
import { U32_MAX, UserPermission } from '../permissions'
import type { File } from './file'

export const RelationshipStatus = {
  None: 'None',
  User: 'User',
  Friend: 'Friend',
  Outgoing: 'Outgoing',
  Incoming: 'Incoming',
  Blocked: 'Blocked',
  BlockedOther: 'BlockedOther',
} as const

export function getRelationshipStatus(status: string): RelationshipStatus {
  switch (status) {
    case 'None':
    case 'User':
    case 'Friend':
    case 'Outgoing':
    case 'Incoming':
    case 'Blocked':
    case 'BlockedOther':
      return status
    default:
      console.warn(`Unknown status: ${status}, defaulting to 'None'`)
      return 'None'
  }
}

export type RelationshipStatus = (typeof RelationshipStatus)[keyof typeof RelationshipStatus]

export class User {
  readonly #collection: UserCollection
  readonly id: string

  constructor(collection: UserCollection, id: string) {
    this.#collection = collection
    this.id = id
  }

  /**
   * Write to string as a user mention
   * @returns Formatted String
   */
  toString(): string {
    return `<@${this.id}>`
  }

  /**
   * Whether this user is ourselves
   */
  get self(): boolean {
    return this.#collection.client.user?.id === this.id
  }

  get #user() {
    return this.#collection.getUnderlyingObject(this.id)
  }

  /**
   * Relationship with user
   */
  get relationship(): RelationshipStatus {
    return (
      getRelationshipStatus(this.#collection.getUnderlyingObject(this.id).relationship) ??
      RelationshipStatus.None
    )
  }

  get username(): string {
    return this.#user.username
  }

  /**
   * Avatar
   */
  get avatar(): File | undefined {
    return this.#user.avatar
  }

  /**
   * Whether the user is privileged
   */
  get privileged(): boolean {
    return this.#user.privileged
  }

  /**
   * Bot information
   */
  get bot(): { owner: string } | undefined {
    return this.#user.bot
  }

  /**
   * URL to the user's avatar
   */
  get avatarURL(): string {
    return this.avatar?.createFileURL() ?? this.defaultAvatarURL
  }

  /**
   * URL to the user's default avatar
   */
  get defaultAvatarURL(): string {
    return `${this.#collection.client.options.baseURL}/users/${this.id}/default_avatar`
  }

  /**
   * Presence
   */
  get presence(): string {
    return this.online ? (this.status?.presence ?? 'online') : 'invisible'
  }

  /**
   * Whether the user is online
   */
  get online(): boolean {
    return this.#user.online ?? false
  }

  /**
   * Display Name
   */
  get displayName(): string {
    return this.#user.displayName ?? this.#user.username
  }

  /**
   * Permissions against this user
   */
  get permission(): number {
    let permissions = 0
    switch (this.relationship) {
      case RelationshipStatus.Friend:
      case RelationshipStatus.User:
        return U32_MAX
      case RelationshipStatus.Blocked:
      case RelationshipStatus.BlockedOther:
        return UserPermission.Access
      case RelationshipStatus.Incoming:
      case RelationshipStatus.Outgoing:
        permissions = UserPermission.Access
    }

    if (
      this.#collection.client.channels.find(
        (chan) => (chan.group !== undefined || chan.direct !== undefined) && chan.recipientIds.has(this.id)
      ) ||
      this.#collection.client.serverMembers.find((member) => member.id.user === this.id)
    ) {
      if (this.#collection.client.user?.bot || this.bot) {
        permissions |= UserPermission.SendMessage
      }

      permissions |= UserPermission.Access | UserPermission.ViewProfile
    }

    return permissions
  }

  /**
   * User Status
   */
  get status(): { text?: string | undefined; presence?: string | undefined } | undefined {
    // TODO: issue with API, upstream fix required #319
    if (!this.online) return { text: undefined, presence: 'invisible' as const }
    return { text: this.#user.statusText }
  }
}
