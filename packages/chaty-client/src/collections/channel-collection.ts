import type { Channel as APIChannel } from '@chaty-app/proto/web-plain/service/v1/channels_db';

import type { HydratedChannel } from '../hydration'
import { Channel } from '../models'
import { ClassCollection } from './collection'

/**
 * Collection of Channels
 */
export class ChannelCollection extends ClassCollection<Channel, HydratedChannel> {

  /**
   * Get or create
   * @param id Id
   * @param data Data
   * @param isNew Whether this object is new
   */
  getOrCreate(id: string, data: APIChannel, isNew = false): Channel {
    if (this.has(id) && !this.isPartial(id)) {
      return this.get(id)!;
    } else {
      const instance = new Channel(this, id);
      this.create(id, "channel", instance, this.client, data);
      if (isNew) this.client.emit("channelCreate", [instance]);
      return instance;
    }
  }

}
