import type { ChannelUnread } from '@chaty-app/proto/web-plain/service/v1/channels'
import type { Channel } from '@chaty-app/proto/web-plain/service/v1/channels_db'
import type { Message } from '@chaty-app/proto/web-plain/service/v1/messages_db'
import type { ServerMember } from '@chaty-app/proto/web-plain/service/v1/server_members_db'
import type { Server } from '@chaty-app/proto/web-plain/service/v1/servers_db'
import type { User } from '@chaty-app/proto/web-plain/service/v1/users_db'

/**
 * Version 1 of the events protocol
 */
export type ProtocolV1 = {
  client: ClientMessage
  server: ServerMessage
  types: {
    policyChange: PolicyChange
  }
}

/**
 * Messages sent to the server
 */
type ClientMessage =
  | { type: 'Authenticate'; token: string }
  | { type: 'BeginTyping'; channel: string }
  | {
    type: 'EndTyping'
    channel: string
  }
  | {
    type: 'Ping'
    data: number
  }
  | {
    type: 'Pong'
    data: number
  }

/**
 * Messages sent from the server
 */
type ServerMessage =
  | { type: 'Error'; data: any }
  | { type: 'Bulk'; v: ServerMessage[] }
  | { type: 'Authenticated' }
  | ({ type: 'Ready' } & ReadyData)
  | { type: 'Ping'; data: number }
  | { type: 'Pong'; data: number }
  | ({ type: 'Message' } & Message)
  | { type: 'MessageUpdate'; id: string; channel: string; data: Partial<Message> }
  | { type: 'MessageAppend'; id: string; channel: string; data: Pick<Partial<Message>, 'embeds'> }
  | { type: 'MessageDelete'; id: string; channel: string }
  | { type: 'MessageReact'; id: string; channel_id: string; user_id: string; emoji_id: string }
  | { type: 'MessageUnreact'; id: string; channel_id: string; user_id: string; emoji_id: string }
  | {
    type: 'MessageRemoveReaction'
    id: string
    channel_id: string
    emoji_id: string
  }
  | { type: 'MessageBulkDelete'; channel: string; ids: string[] }
  | ({ type: 'ChannelCreate' } & Channel)

/**
 * Policy change type
 */
export type PolicyChange = {
  created_time: string
  effective_time: string
  description: string
  url: string
}

/**
 * Initial synchronisation packet
 */
type ReadyData = {
  users: User[]
  servers: Server[]
  channels: Channel[]
  members: ServerMember
  voice_states: ChannelVoiceState[]
  user_settings: Record<string, unknown>
  channel_unreads: ChannelUnread[]

  policy_change: PolicyChange
}

/**
 * Voice state for a channel
 */
type ChannelVoiceState = {
  id: string
  participants: UserVoiceState
}

/**
 * Voice state for a user
 */
export type UserVoiceState = {
  id: string
  joined_at: number
  is_receiving: boolean
  is_publishing: boolean
  screensharing: boolean
  camera: boolean
}

/**
 * Handle an event for the Client
 * @param client Client
 * @param event Event
 * @param setReady Signal state change
 */
export async function handleEvent(event: ServerMessage) { }
