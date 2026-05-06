import type { ServerMember as APIServerMember } from '@chaty-app/proto/web-plain/service/v1/server_members_db'

import type { MemberCompositeKey } from '../models'
import type { Hydrate } from '.'

export type HydratedServerMember = Omit<APIServerMember, 'id'> & {
  id: MemberCompositeKey
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
    avatar: (member, ctx) => member.avatar,
    roles: (member) => member.roles,
    timeout: (member) => member.timeout,
  },
  initialHydration: () => ({
    roles: [],
  }),
}
