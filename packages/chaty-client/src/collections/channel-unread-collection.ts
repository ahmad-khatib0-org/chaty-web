import { ChannelUnread as APIChannelUnread } from '@chaty-app/proto/web-plain/service/v1/channels'

import type { HydratedChannelUnread } from '../hydration'
import { Channel, ChannelUnread } from '../models'
import { ClassCollection } from './collection'

export class ChannelUnreadCollection extends ClassCollection<ChannelUnread, HydratedChannelUnread> {
  /**
   * Get or create
   * @param id Id
   * @param data Data
   */
  getOrCreate(id: string, data: APIChannelUnread): ChannelUnread {
    if (this.has(id)) {
      return this.get(id)!
    } else {
      const instance = new ChannelUnread(this, id)
      this.create(id, 'channelUnread', instance, this.client, data)
      return instance
    }
  }

  /**
   * Get channel unread data for a specific Channel
   * @param channel Channel
   * @returns Unread
   */
  for(channel: Channel): ChannelUnread {
    return this.getOrCreate(channel.id, {
      id: {
        channel: channel.id,
        user: this.client.user!.id,
      },
      lastId: undefined,
      mentions: [],
    })
  }
}
