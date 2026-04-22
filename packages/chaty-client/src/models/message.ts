import { MessageWebhook as MessageWebhookAPI } from '@chaty-app/proto/web-plain/service/v1/messages_db'

import type { MessageCollection } from '../collections'
import type { HydratedMessage } from '../hydration'

export class Message {
  readonly #collection: MessageCollection
  readonly id: string

  constructor(collection: MessageCollection, id: string) {
    this.#collection = collection
    this.id = id
  }

  get channel(): HydratedMessage {
    return this.#collection.getUnderlyingObject(this.id)
  }

  get channelId(): string {
    return this.channel.channelId
  }
}

export class MessageWebhook {
  readonly webhook: MessageWebhookAPI

  constructor(webhook: MessageWebhookAPI) {
    this.webhook = webhook
  }
}
