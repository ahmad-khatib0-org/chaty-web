import type { Channel } from '@chaty-app/proto/web-plain/service/v1/channels_db'
import type { Hydrate } from '.'

export type HydratedChannel = Channel & {
  typingIds: Set<string>
}

export const channelHydration: Hydrate<Channel, HydratedChannel> = {
  keyMapping: {},
  initialHydration: () => ({
    typingIds: new Set(),
  }),
  functions: {
    id: (channel) => channel.id,
    channelType: (channel) => channel.channelType,
    saved: (channel) => channel.saved,
    direct: (channel) => channel.direct,
    text: (channel) => channel.text,
    group: (channel) => channel.group,
    voiceMaxUsers: (channel) => channel.voiceMaxUsers,
    createdAt: (channel) => channel.createdAt,
    updatedAt: (channel) => channel.updatedAt,
    typingIds: (channel) => new Set(),
  },
}
