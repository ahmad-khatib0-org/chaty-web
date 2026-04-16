import { MessageWebhook as MessageWebhookAPI } from '@chaty-app/proto/web-plain/service/v1/messages_db'
import type { MessageCollection } from '../collections'

export class Message {
  readonly #collection: MessageCollection
  readonly id: string

  constructor(collection: MessageCollection, id: string) {
    this.#collection = collection
    this.id = id
  }
}

export class MessageWebhook {
  readonly webhook: MessageWebhookAPI

  constructor(webhook: MessageWebhookAPI) {
    this.webhook = webhook
  }
}
