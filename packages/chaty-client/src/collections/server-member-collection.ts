import type { HydratedServerMember } from '../hydration'
import type { MemberCompositeKey, ServerMember } from '../models'
import { ClassCollection } from './collection'

export class ServerMemberCollection extends ClassCollection<ServerMember, HydratedServerMember> {
  /**
   * Check if member exists by composite key
   * @param id Id
   * @returns Whether it exists
   */
  hasByKey(id: MemberCompositeKey): boolean {
    return super.has(id.server + id.user)
  }

  /**
   * Get member by composite key
   * @param id Id
   * @returns Member
   */
  getByKey(id: MemberCompositeKey): ServerMember | undefined {
    return super.get(id.server + id.user)
  }
}
