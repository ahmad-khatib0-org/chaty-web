import { decodeTime } from 'ulid'
import type { EmojiParent } from '@chaty-app/proto/web-plain/service/v1/emoji'

import type { EmojiCollection } from '../collections'
import type { User } from './user'

/**
 * Emoji Class
 */
export class Emoji {
  readonly #collection: EmojiCollection
  readonly id: string

  /**
   * Construct Emoji
   * @param collection Collection
   * @param id Emoji Id
   */
  constructor(collection: EmojiCollection, id: string) {
    this.#collection = collection
    this.id = id
  }

  /**
   * Convert to string
   * @returns String
   */
  toString(): string {
    return `:${this.id}:`
  }

  /**
   * Whether this object exists
   */
  get $exists(): boolean {
    return !!this.#collection.getUnderlyingObject(this.id).id
  }

  /**
   * Time when this emoji was created
   */
  get createdAt(): Date {
    return new Date(decodeTime(this.id))
  }

  /**
   * Information about the parent of this emoji
   */
  get parent(): EmojiParent | undefined {
    return this.#collection.getUnderlyingObject(this.id).parent
  }

  /**
   * Creator of the emoji
   */
  get creator(): User | undefined {
    return this.#collection.client.users.get(this.#collection.getUnderlyingObject(this.id).creatorId)
  }

  /**
   * Name
   */
  get name(): string {
    return this.#collection.getUnderlyingObject(this.id).name
  }

  /**
   * Whether the emoji is animated
   */
  get animated(): boolean {
    return this.#collection.getUnderlyingObject(this.id).animated
  }

  /**
   * Whether the emoji is marked as mature
   */
  get mature(): boolean {
    return this.#collection.getUnderlyingObject(this.id).nsfw
  }

  /**
   * URL to emoji
   */
  get url() {
    return `${this.#collection.client.configuration?.features?.files?.url}/emojis/${this.id}`
  }
}
