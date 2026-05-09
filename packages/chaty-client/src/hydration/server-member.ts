import type { ServerMember as APIServerMember } from '@chaty-app/proto/web-plain/service/v1/server_members_db'

import type { Hydrate } from '.'
import { File, type MemberCompositeKey } from '../models'
import type { Client } from '../client'

export type HydratedServerMember = Omit<APIServerMember, 'id' | 'avatar'> & {
  id: MemberCompositeKey
  avatar: File
}

export const serverMemberHydration: Hydrate<APIServerMember, HydratedServerMember> = {
  keyMapping: {},
  functions: {
    id: (member) => `${member.serverId}${member.userId}`,
    userId: (member) => member.userId,
    serverId: (member) => member.serverId,
    username: (member) => member.username,
    canPublish: (member) => member.canPublish,
    canReceive: (member) => member.canReceive,
    joinedAt: (member) => member.joinedAt,
    nickname: (member) => member.nickname!,
    avatar: (member, ctx) => new File(ctx as Client, member.avatar ?? File.getDefaultAPIFile()),
    roles: (member) => member.roles,
    timeout: (member) => member.timeout,
  },
  initialHydration: () => ({
    roles: [],
  }),
}
