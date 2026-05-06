import type {
  ChannelDirectMessage,
  ChannelGroup,
  ChannelSavedMessages,
  ChannelText,
} from '@chaty-app/proto/web-plain/service/v1/channels_db'
import { ChannelCollection } from '../collections'
import type { User } from './user'

export enum ChannelType {
  Text = 'text',
  Group = 'group',
  SavedMessages = 'saved_messages',
  DirectMessage = 'direct_message',
}

function getChannelType(channelType: string): ChannelType {
  switch (channelType) {
    case 'text':
      return ChannelType.Text
    case 'group':
      return ChannelType.Group
    case 'saved_messages':
      return ChannelType.SavedMessages
    case 'direct_message':
      return ChannelType.DirectMessage
    default:
      console.log('unknown channel type received: ', channelType)
      return ChannelType.Text
  }
}

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

  get type(): ChannelType {
    return getChannelType(this.channel.channelType)
  }

  get saved(): ChannelSavedMessages | undefined {
    return this.channel.saved
  }

  get direct(): ChannelDirectMessage | undefined {
    return this.channel.direct
  }

  get group(): ChannelGroup | undefined {
    return this.channel.group
  }

  get text(): ChannelText | undefined {
    return this.channel.text
  }

  /**
   * Server ID
   */
  get serverId(): string | undefined {
    return this.text?.serverId
  }

  /**
   * Recipients of the group
   */
  get recipients(): User[] {
    return [...(this.#collection.getUnderlyingObject(this.id).group?.recipients ?? []).values()].map(
      (id) => this.#collection.client.users.get(id)!
    )
  }

  /**
   * Find recipient of this DM
   */
  get recipient(): User | undefined {
    return this.type === ChannelType.DirectMessage
      ? this.recipients?.find((user) => user?.id !== this.#collection.client.user!.id)
      : undefined
  }
}
