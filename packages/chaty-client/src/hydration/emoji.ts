import { Emoji } from '@chaty-app/proto/web-plain/service/v1/emoji'
import type { Hydrate } from '.'

export type HydratedEmoji = Emoji & {}

export const emojiHydration: Hydrate<Emoji, HydratedEmoji> = {
  keyMapping: {},
  functions: {
    id: (emoji) => emoji.id,
    parent: (emoji) => emoji.parent,
    creatorId: (emoji) => emoji.creatorId,
    name: (emoji) => emoji.name,
    animated: (emoji) => emoji.animated || false,
    nsfw: (emoji) => emoji.nsfw || false,
  },
  initialHydration: () => ({}),
}
