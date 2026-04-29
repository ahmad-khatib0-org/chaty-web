import type { Channel } from '@chaty-app/proto/web-plain/service/v1/channels_db'
import type { Hydrate } from '.'

export type HydratedChannel = Channel & {}

export const channelHydration: Hydrate<Channel, HydratedChannel> = {
  keyMapping: {},
  initialHydration: () => ({}),
  functions: {
    id: (channel) => channel.id,
    channelType: (channel) => channel.channelType,
    saved: (channel) => channel.saved,
    direct: (channel) => channel.direct,
    text: (channel) => channel.text,
    group: (channel) => channel.group,
    createdAt: (channel) => channel.createdAt,
    updatedAt: (channel) => channel.updatedAt,
    voiceMaxUsers: (channel) => channel.voiceMaxUsers,
  },
}
