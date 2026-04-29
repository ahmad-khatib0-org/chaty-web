import { ChannelCollection } from '../collections'

export class Channel {
  readonly #collection: ChannelCollection
  readonly id: string

  constructor(channel: ChannelCollection, id: string) {
    this.#collection = channel
    this.id = id
  }

  /**
   * Write to string as a channel mention
   * @returns Formatted String
   */
  toString(): string {
    return `<#${this.id}>`
  }

  get channel() {
    return this.#collection.getUnderlyingObject(this.id)
  }

  /**
   * ID of the last message sent in this channel
   */
  get lastMessageId(): string | undefined {
    const group = this.#collection.getUnderlyingObject(this.id).group
    const text = this.#collection.getUnderlyingObject(this.id).text
    const direct = this.#collection.getUnderlyingObject(this.id).direct
    return group ? group.lastMessageId : text ? text.lastMessageId : direct?.lastMessageId
  }
}
