import type { Hydrate } from '.'
import type { ChannelUnread } from '../models'

export type HydratedChannelUnread = {
  id: string
  lastMessageId?: string
  messageMentionIds: Set<string>
}

export const channelUnreadHydration: Hydrate<ChannelUnread, HydratedChannelUnread> = {
  keyMapping: {},
  functions: {
    id: (unread) => unread.id,
    lastMessageId: (unread) => unread.lastMessageId,
    messageMentionIds: (unread) => new Set(unread.messageMentionIds),
  },
  initialHydration: () => ({
    messageMentionIds: new Set(),
  }),
}
