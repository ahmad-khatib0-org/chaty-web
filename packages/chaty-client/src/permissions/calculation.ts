import type { Client } from '../client'
import { Server, type Channel, type ServerMember } from '../models'
import {
  ALLOW_IN_TIMEOUT,
  DEFAULT_PERMISSION_DIRECT_MESSAGE,
  DEFAULT_PERMISSION_VIEW_ONLY,
  Permission,
  UserPermission,
} from './definition'

/**
 * Check whether `b` is present in `a`
 * @param a Input A
 * @param b Inputs (OR'd together)
 */
export function bitwiseAndEq(a: bigint, ...b: bigint[]): boolean {
  const value = b.reduce((prev, cur) => prev | cur, 0n)
  return (value & a) === value
}

/**
 * Calculate permissions against a given object
 * @param target Target object to check permissions against
 * @param options Additional options to use when calculating
 */
export function calculatePermission(
  client: Client,
  target: Channel | Server,
  options?: {
    /**
     * Pretend to be another ServerMember
     */
    member?: ServerMember
  }
): bigint {
  const user = options?.member ? options.member.user : client.user
  if (user?.privileged) return Permission.GrantAllSafe

  if (target instanceof Server) {
    if (target.ownerId === user?.id) return Permission.GrantAllSafe
    else {
      const member = options?.member ??
        client.serverMembers.getByKey({ user: user?.id ?? '', server: target.id }) ?? {
        roles: null,
        timeout: null,
      }

      if (!member) return 0n

      // Apply allows from default_permissions.
      let perm = BigInt(target.defaultPermissions)
      // If user has roles, iterate in order.
      if (member.roles && target.roles) {
        // Apply allows and denies from roles.
        const permissions = member.orderedRoles.map((role) => role.permissions ?? { a: 0, d: 0 })
        for (const permission of permissions) {
          perm = (perm | BigInt(permission.a)) & ~BigInt(permission.d)
        }
      }

      // Revoke permissions if ServerMember is timed out.
      if (member.timeout && member.timeout > Date.now()) {
        perm = perm & BigInt(ALLOW_IN_TIMEOUT)
      }

      return perm
    }
  } else {
    if (target.saved) return Permission.GrantAllSafe

    if (target.direct) {
      const userPermissions = target.recipient?.permission || 0
      if (userPermissions & UserPermission.SendMessage) return DEFAULT_PERMISSION_DIRECT_MESSAGE
      else DEFAULT_PERMISSION_VIEW_ONLY
    }

    if (target.group) {
      if (target.ownerId === user?.id) return Permission.GrantAllSafe
      // Pull out group permissions.
      else return target.permissions ?? DEFAULT_PERMISSION_DIRECT_MESSAGE
    }

    if (target.text) {
      const server = target.server
      if (!server) return 0n

      if (server.ownerId === user?.id) return Permission.GrantAllSafe
      else {
        const member = options?.member ??
          client.serverMembers.getByKey({ user: user?.id ?? '', server: server.id }) ?? {
          roles: null,
          timeout: null,
        }

        if (!member) return 0n

        // Apply default allows and denies for channel.
        let perm = BigInt(calculatePermission(client, server, options))
        if (target.defaultPermissions) {
          perm = (perm | BigInt(target.defaultPermissions.a)) & ~BigInt(target.defaultPermissions.d)
        }

        // If user has roles, iterate in order.
        if (member.roles && target.defaultPermissions && server.roles) {
          // Apply allows and denies from roles.
          const roles = member.orderedRoles.map(({ id }) => id)

          for (const id of roles) {
            const override = target.rolePermissions?.[id]
            if (override) {
              perm = (perm | BigInt(override.a)) & ~BigInt(override.d)
            }
          }
        }

        // Revoke permissions if ServerMember is timed out.
        if (member.timeout && member.timeout > Date.now()) {
          perm = perm & BigInt(ALLOW_IN_TIMEOUT)
        }

        return perm
      }
    }

    return 0n
  }
}
