import type { Client } from '../client'
import type { HydratedUser } from '../hydration'
import type { User } from '../models'
import { ClassCollection } from './collection'

export class UserCollection extends ClassCollection<User, HydratedUser> {
  constructor(client: Client) {
    super(client)
  }
}
