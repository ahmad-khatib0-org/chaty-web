import { type Message as APIMessage } from '@chaty-app/proto/web-plain/service/v1/messages_db'

import { ClassCollection } from './collection'
import { Message } from '../models'
import { type HydratedMessage } from '../hydration'

export class MessageCollection extends ClassCollection<Message, HydratedMessage> {
  /**
   * Get or create
   * @param id Id
   * @param data Data
   * @param isNew Whether this object is new
   */
  getOrCreate(id: string, data: APIMessage, isNew = false): Message {
    if (this.has(id) && !this.isPartial(id)) {
      return this.get(id)!
    } else {
      const instance = new Message(this, id)
      this.create(id, 'message', instance, this.client, data)
      if (isNew) this.client.emit('messageCreate', [instance])
      return instance
    }
  }
}
