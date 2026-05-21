import { ClassCollection } from './collection'
import type { Emoji } from '../models'
import type { HydratedEmoji } from '../hydration'

/**
 * Collection of Emoji
 */
export class EmojiCollection extends ClassCollection<Emoji, HydratedEmoji> { }
