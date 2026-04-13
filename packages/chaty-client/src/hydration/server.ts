import type { Hydrate } from '.'

import type { Server } from '@chaty-app/proto/web-plain/service/v1/servers_db'

export type HydratedServer = Server & {}

export const serverHydration: Hydrate<Server, HydratedServer> = {
  keyMapping: {},
  initialHydration: () => ({}),
  functions: {
    id: (server) => server.id,
    ownerId: (server) => server.ownerId,
    name: (server) => server.name,
    description: (server) => server.description!,
    channels: (server: Server) => server.channels,
    categories: (server) => server.categories ?? [],
    systemMessages: (server) => server.systemMessages ?? {},
    roles: (server) => server.roles,
    defaultPermissions: (server) => server.defaultPermissions,
    icon: (server, ctx) => server.icon,
    banner: (server, ctx) => server.banner,
    flags: (server) => server.flags!,
    analytics: (server) => server.analytics || false,
    discoverable: (server) => server.discoverable || false,
    nsfw: (server) => server.nsfw || false,
    createdAt: (server) => server.createdAt,
    updatedAt: (server) => server.updatedAt,
    stats: (server) => server.stats,
  },
}
