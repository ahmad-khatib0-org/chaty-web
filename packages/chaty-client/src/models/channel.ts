import { decodeTime, ulid } from 'ulid'

import type {
  ChannelDirectMessage,
  ChannelGroup,
  ChannelSavedMessages,
  ChannelText,
} from '@chaty-app/proto/web-plain/service/v1/channels_db'
import type { MessageIntent } from '@chaty-app/proto/web-plain/service/v1/messages'
import { ChannelCollection, MessageCollection } from '../collections'
import type { User } from './user'
import type { Server } from './server'
import { Message } from './message'
import { Permission } from '../permissions'
import { bitwiseAndEq, calculatePermission } from '../permissions/calculation'

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

  #ackTimeout?: number
  #ackLimit?: number | undefined
  #manuallyMarked?: boolean

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
   * Check whether we have a given permission in a channel
   * @param permission Permission Names
   * @returns Whether we have this permission
   */
  havePermission(...permission: (keyof typeof Permission)[]): boolean {
    return bitwiseAndEq(this.permission, ...permission.map((x) => Permission[x]))
  }

  /**
   * ID of the last message sent in this channel
   */
  get lastMessageId(): string | undefined {
    const { group, text, direct } = this
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
   * Server this channel is in
   */
  get server(): Server | undefined {
    return this.#collection.client.servers.get(this.text?.serverId ?? '')
  }

  /**
   * Default permissions for this server channel
   */
  get defaultPermissions(): { a: bigint; d: bigint } | undefined {
    return this.text?.defaultPermissions
  }

  /**
   * Recipients of the group
   */
  get recipients(): User[] {
    return [...(this.group?.recipients ?? []).values()].map((id) => this.#collection.client.users.get(id)!)
  }

  /**
   * User ids of recipients of the group
   */
  get recipientIds(): Set<string> {
    return new Set(this.channel.group?.recipients ?? [])
  }

  /**
   * Owner ID
   */
  get ownerId(): string {
    const { group, server, saved } = this
    return group ? group.userId : server ? server.ownerId : (saved?.userId ?? '')
  }

  /**
   * Users currently trying in channel
   */
  get typing(): User[] {
    return [...this.typingIds.values()].map((id) => this.#collection.client.users.get(id)!)
  }

  /**
   * User ids of people currently typing in channel
   */
  get typingIds(): Set<string> {
    return this.channel.typingIds
  }

  /**
   * Find recipient of this DM
   */
  get recipient(): User | undefined {
    return this.type === ChannelType.DirectMessage
      ? this.recipients?.find((user) => user?.id !== this.#collection.client.user!.id)
      : undefined
  }

  /**
   * Time when the channel was last updated (either created or a message was sent)
   */
  get updatedAt(): Date {
    return this.lastMessageAt ?? this.createdAt
  }

  /**
   * Time when this server was created
   */
  get createdAt(): Date {
    return new Date(decodeTime(this.id))
  }

  /**
   * Time when the last message was sent
   */
  get lastMessageAt(): Date | undefined {
    return this.lastMessageId ? new Date(decodeTime(this.lastMessageId)) : undefined
  }

  /**
   * Whether this channel is marked as mature
   */
  get mature(): boolean {
    return this.text?.nsfw ?? this.group?.nsfw ?? false
  }

  get name(): string {
    return this.text ? this.text.name : this.group ? this.group.name : ''
  }

  /**
   * Role permissions for this server channel
   */
  get rolePermissions(): Record<string, { a: bigint; d: bigint }> | undefined {
    return this.channel.text?.rolePermissions
  }

  /**
   * Channel description
   */
  get description(): string | undefined {
    const { text, group } = this
    return text ? text.description : group ? group.description : undefined
  }

  /**
   * Permission the currently authenticated user has against this channel
   */
  get permission(): bigint {
    return calculatePermission(this.#collection.client, this)
  }

  get voiceMaxUsers(): number | undefined {
    return this.channel.voiceMaxUsers
  }

  /**
   * Permissions allowed for users in this group
   */
  get permissions(): bigint | undefined {
    return this.group?.permissions
  }

  /**
   * Whether this channel is unread
   */
  get unread(): boolean {
    if (!this.lastMessageId || this.saved || this.#collection.client.options.channelExclusiveMuted(this)) {
      return false
    }

    const unread = this.#collection.client.channelUnreads.for(this)
    return (
      (unread.lastMessageId ?? '0').localeCompare(this.lastMessageId) === -1 ||
      unread.messageMentionIds.size > 0
    )
  }

  /**
   * Check whether we have at least one of the given permissions in a channel
   * @param permission Permission Names
   * @returns Whether we have one of the permissions
   */
  orPermission(...permissions: (keyof typeof Permission)[]): boolean {
    return permissions.findIndex((x) => bitwiseAndEq(this.permission, Permission[x])) !== -1
  }

  /**
   * Whether this is a 'voice chats' channel
   *
   */
  get isVoice(): boolean {
    const { group, direct, voiceMaxUsers } = this
    return group !== undefined || direct !== undefined || (voiceMaxUsers ?? 0) > 0
  }

  /**
   * Whether this channel may be hidden to some users
   */
  get potentiallyRestrictedChannel(): boolean | string | undefined {
    if (!this.serverId) return false

    return (
      bitwiseAndEq(this.defaultPermissions?.d ?? 0n, Permission.ViewChannel) ||
      !bitwiseAndEq(this.server!.defaultPermissions, Permission.ViewChannel) ||
      [...(this.server?.roles.keys() ?? [])].find(
        (role) =>
          bitwiseAndEq(this.rolePermissions?.[role]?.d ?? 0n, Permission.ViewChannel) ||
          bitwiseAndEq(this.server?.roles.get(role)?.permissions.d ?? 0n, Permission.ViewChannel)
      )
    )
  }

  /**
   * Mark a channel as read
   * @param message Last read message or its ID
   * @param skipRateLimiter Whether to skip the internal rate limiter
   * @param skipRequest For internal updates only
   * @param skipNextMarking For internal usage only
   * @requires `SavedMessages`, `DirectMessage`, `Group`, `TextChannel`
   */
  async ack(
    message?: Message | string,
    skipRateLimiter?: boolean,
    skipRequest?: boolean,
    skipNextMarking?: boolean
  ): Promise<void> {
    if (!message && this.#manuallyMarked) {
      this.#manuallyMarked = false
      return
    }
    // Skip the next unread marking
    else if (skipNextMarking) {
      this.#manuallyMarked = true
    }

    const lastMsgId = (typeof message === 'string' ? message : message?.id) ?? this.lastMessageId ?? ulid()
    const channelUnread = this.#collection.client.channelUnreads.for(this)

    this.#collection.client.channelUnreads.updateUnderlyingObject(this.id, { lastMessageId: lastMsgId })
    if (channelUnread.messageMentionIds.size) {
      channelUnread.messageMentionIds.clear()
    }

    // Skip request if not needed
    if (skipRequest) return

    const performAck = (): void => {
      this.#ackLimit = undefined
      // TODO: send an rpc call to /channels/${this.id}/ack/${lastMessageId as ""}
    }

    if (skipRateLimiter) return performAck()

    clearTimeout(this.#ackTimeout)
    if (this.#ackLimit && +new Date() > this.#ackLimit) {
      performAck()
    }

    this.#ackTimeout = setTimeout(performAck, 1500)

    if (!this.#ackLimit) {
      this.#ackLimit = +new Date() + 4e3
    }
  }

  /**
   * Send a message
   * @param data Either the message as a string or message sending route data
   * @requires `saved`, `direct`, `group`, `text`
   * @returns Sent message
   */
  // TODO: implement
  async sendMessage(data: string | MessageIntent, idempotencyKey: string = ulid()): Promise<Message> {
    return new Message(new MessageCollection(this.#collection.client), '')
  }
}
