import type { Role as APIRole } from '@chaty-app/proto/web-plain/service/v1/roles_db'

import type { Client } from '../client'

export class ServerRole {
  protected client: Client
  protected serverId: string

  readonly id: string
  readonly name: string
  readonly permissions: {
    a: bigint
    d: bigint
  }
  readonly colour: string | undefined
  readonly hoist: boolean
  readonly rank: bigint

  /**
   * Construct server role
   * @param client Client
   * @param serverId Server ID
   * @param id Role ID
   * @param data Role data
   */
  constructor(client: Client, serverId: string, id: string, data: APIRole) {
    this.client = client
    this.serverId = serverId

    this.id = id
    this.name = data.name
    this.permissions = {
      a: BigInt(data.permissions?.a ?? '0'),
      d: BigInt(data.permissions?.d ?? '0'),
    }
    this.colour = data.colour
    this.hoist = data.hoist || false
    this.rank = data.rank
  }

  /**
   * Write to string as a role mention
   * @returns Formatted String
   */
  toString(): string {
    return `<%${this.id}>`
  }

  /**
   * Server attached to this role
   */
  get server() {
    return this.client.servers.get(this.serverId)
  }

  /**
   * Whether this role is assigned to our server member
   */
  get assigned() {
    return this.server?.member?.roles.includes(this.id) || false
  }
}
