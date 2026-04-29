import type { HydratedChannel } from '../hydration'
import type { Channel } from '../models'
import { ClassCollection } from './collection'

/**
 * Collection of Channels
 */
export class ChannelCollection extends ClassCollection<Channel, HydratedChannel> { }
