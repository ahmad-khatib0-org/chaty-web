import type { Bot } from '@chaty-app/proto/web-plain/service/v1/bots_db'
import type { Hydrate } from '.'

export type HydratedBot = Bot & {}

export const botHydration: Hydrate<Bot, HydratedBot> = {
  keyMapping: {},
  functions: {
    owner: (bot) => bot.owner,
  },
  initialHydration: () => ({}),
}
