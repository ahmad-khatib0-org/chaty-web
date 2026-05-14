import type { Hydrate } from '.'

import type { Server } from '@chaty-app/proto/web-plain/service/v1/servers_db'
import { File, type ServerRole } from '../models'
import type { Client } from '../client'

export type HydratedServer = Omit<Server, 'roles' | 'icon'> & {
  roles: Record<string, ServerRole>
  icon?: File
}

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
    icon: (server, ctx) => new File(ctx as Client, server.icon ?? File.getDefaultAPIFile()),
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
