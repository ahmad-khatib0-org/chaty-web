import {
  Masquerade,
  MessageWebhook as MessageWebhookAPI,
} from '@chaty-app/proto/web-plain/service/v1/messages_db'

import type { MessageCollection } from '../collections'
import { MessageFlags, type HydratedMessage } from '../hydration'
import type { MessageSystem } from './message-system'
import type { User } from './user'
import type { MessageEmbed } from './message-embed'
import type { ServerMember } from './server-member'
import type { Channel } from './channel'
import type { Client } from '../client'
import type { Server } from './server'
import type { ServerRole } from './server-role'

export class Message {
  readonly #collection: MessageCollection
  readonly id: string

  constructor(collection: MessageCollection, id: string) {
    this.#collection = collection
    this.id = id
  }

  get message(): HydratedMessage {
    return this.#collection.getUnderlyingObject(this.id)
  }

  get channelId(): string {
    return this.message.channelId
  }

  get createdAt(): number {
    return Number(this.message.createdAt)
  }

  /**
   * Time at which this message was edited
   */
  get editedAt(): number | undefined {
    return this.#collection.getUnderlyingObject(this.id).editedAt
  }

  get authorId() {
    return this.message.authorId
  }

  get masquerade(): Masquerade | undefined {
    return this.message.masquerade
  }

  get system(): MessageSystem | undefined {
    return this.message.system
  }

  /**
   * IDs of messages this message replies to
   */
  get replyIds(): string[] {
    return this.message.replies
  }

  /**
   * User this message was sent by
   */
  get author(): User | undefined {
    return this.#collection.client.users.get(this.message.authorId!)
  }

  /**
   * Nonce value
   */
  get nonce(): string | undefined {
    return this.#collection.getUnderlyingObject(this.id).nonce
  }

  get embeds(): MessageEmbed[] {
    return this.message.embeds
  }

  get content() {
    return this.message.content
  }

  /**
   * Flags
   */
  get flags(): number {
    return this.#collection.getUnderlyingObject(this.id).flags || 0
  }

  /**
   * IDs of users this message mentions
   */
  get mentionIds(): string[] | undefined {
    return this.#collection.getUnderlyingObject(this.id).mentions
  }

  /**
   * IDs of roles this message mentions
   */
  get roleMentionIds(): string[] | undefined {
    return this.#collection.getUnderlyingObject(this.id).roleMentions
  }

  /**
   * Server this message was sent in
   */
  get server(): Server | undefined {
    return this.channel?.server
  }

  /**
   * Roles this message mentions
   */
  get roleMentions(): ServerRole[] | undefined {
    return this.roleMentionIds?.map((roleId) => this.server?.roles[roleId] as ServerRole)
  }

  /**
   * Whether this message mentions us
   */
  get mentioned(): boolean {
    return (
      !!(this.flags & MessageFlags.MentionsEveryone) ||
      !!(this.flags & MessageFlags.MentionsOnline) ||
      this.mentionIds?.includes(this.#collection.client.user!.id) ||
      this.roleMentions?.some((role) => role.assigned) ||
      false
    )
  }

  /**
   * Get the role colour for this message
   */
  get roleColour(): string | undefined {
    return this.masquerade?.colour ?? this.member?.roleColour
  }

  /**
   * Member this message was sent by
   */
  get member(): ServerMember | undefined {
    return this.#collection.client.serverMembers.getByKey({
      server: this.channel?.serverId as string,
      user: this.authorId!,
    })
  }

  /**
   * Channel this message was sent in
   */
  get channel(): Channel | undefined {
    return this.#collection.client.channels.get(this.#collection.getUnderlyingObject(this.id).channelId)
  }

  /**
   * Get the username for this message
   */
  get username(): string | undefined {
    const webhook = this.webhook

    return (
      this.masquerade?.name ?? (webhook ? webhook.name : (this.member?.nickname ?? this.author?.username))
    )
  }

  /**
   * Webhook information for this message
   */
  get webhook(): MessageWebhook | undefined {
    return this.#collection.getUnderlyingObject(this.id).webhook
  }

  /**
   * Get the avatar URL for this message
   */
  get avatarURL(): string | undefined {
    const webhook = this.webhook

    return (
      this.masqueradeAvatarURL ??
      (webhook ? webhook.avatarURL : (this.member?.avatarURL ?? this.author?.avatarURL))
    )
  }

  /**
   * Avatar URL from the masquerade
   */
  get masqueradeAvatarURL(): string | undefined {
    const avatar = this.masquerade?.avatar
    return avatar ? this.#collection.client.proxyFile(avatar) : undefined
  }

  /**
   * Whether this message has suppressed desktop/push notifications
   */
  get isSuppressed(): boolean {
    return (this.flags & 1) === 1
  }
}

export class MessageWebhook {
  readonly webhook: MessageWebhookAPI
  readonly client: Client
  readonly id: string

  constructor(client: Client, webhook: MessageWebhookAPI, id: string) {
    this.webhook = webhook
    this.client = client
    this.id = id
  }

  get name() {
    return this.webhook.name
  }

  get avatar() {
    return this.webhook.avatar
  }

  /**
   * Get the avatar URL for this message webhook
   */
  get avatarURL(): string {
    return this.webhook.icon?.id ?? `${this.client.options.baseURL}/users/${this.id}/default_avatar`
  }
}
