import type { UserCollection } from '../collections'
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
    return this.#collection.getUnderlyingObject(this.id).username
  }

  /**
   * Avatar
   */
  get avatar(): File | undefined {
    return this.#collection.getUnderlyingObject(this.id).avatar
  }

  /**
   * Whether the user is privileged
   */
  get privileged(): boolean {
    return this.#collection.getUnderlyingObject(this.id).privileged
  }

  /**
   * Bot information
   */
  get bot(): { owner: string } | undefined {
    return this.#collection.getUnderlyingObject(this.id).bot
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
}
