import { MessageSystem as APIMessageSystem } from '@chaty-app/proto/web-plain/service/v1/messages_db'

export class MessageSystem {
  #message: APIMessageSystem

  constructor(message: APIMessageSystem) {
    this.#message = message
  }
}
