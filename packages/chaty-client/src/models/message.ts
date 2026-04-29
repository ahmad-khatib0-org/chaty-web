import {
  Masquerade,
  MessageWebhook as MessageWebhookAPI,
} from '@chaty-app/proto/web-plain/service/v1/messages_db'

import type { MessageCollection } from '../collections'
import type { HydratedMessage } from '../hydration'
import type { MessageSystem } from './message-system'
import type { User } from './user'

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
}

export class MessageWebhook {
  readonly webhook: MessageWebhookAPI

  constructor(webhook: MessageWebhookAPI) {
    this.webhook = webhook
  }
}
