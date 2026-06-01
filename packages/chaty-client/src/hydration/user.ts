import type { APIUser } from '@chaty-app/proto/web-plain/service/v1/users'

import type { Hydrate } from '.'
import { File } from '../models'
import type { Client } from '../client'

export type HydratedUser = Omit<APIUser, 'avatar'> & {
  avatar?: File
}

export const userHydration: Hydrate<APIUser, HydratedUser> = {
  keyMapping: {},
  functions: {
    id: (user) => user.id,
    username: (user) => user.username,
    displayName: (user) => user.displayName,
    email: (user) => user.email,
    relations: (user) => user.relations,
    relationship: (user) => user.relationship,
    privileged: (user) => user.privileged,
    badges: (user) => user.badges!,
    profileBackgroundId: (user) => user.profileBackgroundId,
    profileContent: (user) => user.profileContent,
    statusPresence: (user) => user.statusPresence,
    statusText: (user) => user.statusText,
    suspendedUntil: (user) => user.suspendedUntil,
    avatar: (user, ctx) => new File(ctx as Client, user.avatar ?? File.getDefaultAPIFile()),
    bot: (user) => user.bot!,
    online: (user) => user.online,
    verified: (user) => user.verified,
    createdAt: (user) => user.createdAt,
    updatedAt: (user) => user.updatedAt,
  },
  initialHydration: () => ({}),
}
