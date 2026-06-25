import { useMemo } from 'react'

import { Client } from 'chaty-client'
import { Channel, Message, Server, ServerMember, ServerRole, User } from 'chaty-client/models'

export interface AutoCompleteSearchSpace {
  users?: User[]
  members?: ServerMember[]
  channels?: Channel[]
  roles?: ServerRole[]
}

function generateSearchSpaceFrom(
  object: Client | Server | Channel | Message,
  client: Client
): AutoCompleteSearchSpace {
  if (object instanceof Message) {
    if (object.channel) return generateSearchSpaceFrom(object.channel, client)
  } else if (object instanceof Channel) {
    if (object.server) return generateSearchSpaceFrom(object.server, client)
    if (object.group) return { users: object.recipients }
  } else if (object instanceof Server) {
    return {
      members: client.serverMembers.filter((member) => member.id.server === object.id),
      channels: object.channels,
      roles: [...object.roles.values()],
    }
  }

  return {}
}

export function useSearchSpace(
  object: Client | Server | Channel | Message,
  client: Client
): AutoCompleteSearchSpace {
  return useMemo(() => generateSearchSpaceFrom(object, client), [object, client])
}
