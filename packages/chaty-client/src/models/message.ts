import {
  Masquerade,
  MessageWebhook as MessageWebhookAPI,
} from '@chaty-app/proto/web-plain/service/v1/messages_db'

import type { MessageCollection } from '../collections'
import type { HydratedMessage } from '../hydration'
import type { MessageSystem } from './message-system'
import type { User } from './user'
import type { MessageEmbed } from './message-embed'
import type { ServerMember } from './server-member'
import type { Channel } from './channel'

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
    return this.#collection.getUnderlyingObject(this.id).webhook!
  }
}

export class MessageWebhook {
  readonly webhook: MessageWebhookAPI

  constructor(webhook: MessageWebhookAPI) {
    this.webhook = webhook
  }

  get name() {
    return this.webhook.name
  }

  get avatar() {
    return this.webhook.avatar
  }
}
