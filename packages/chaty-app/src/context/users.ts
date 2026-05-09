import { ServerMember, User } from 'chaty-client/models'
import { useClient } from './client'
import { useEffect, useState } from 'react'

interface UserInformation {
  /**
   * Username or nickname
   */
  username: string

  /**
   * Avatar or server profile avatar
   */
  avatar?: string

  /**
   * Role colour
   */
  colour?: string | null

  /**
   * Underlying user
   */
  user?: User

  /**
   * Underlying member
   */
  member?: ServerMember
}

/**
 * Create user information from given objects
 * @param user User
 * @param member Member
 * @returns Information
 */
export function userInformation(user?: User, member?: ServerMember): UserInformation {
  return {
    username: member?.nickname ?? user?.username ?? 'Unknown User',
    avatar: member?.avatar?.createFileURL(),
    colour: member?.roleColour,
    user,
    member,
  }
}

/**
 * Resolve multiple users by their ID within the current context
 * @param ids User IDs
 * @param filterNull Filter out null values
 * @returns User information
 */
export function useUsers(ids: string[], filterNull?: boolean) {
  const client = useClient()
  const [users, setUsers] = useState<(UserInformation | undefined)[]>([])
  const serverId = 'some-server-id' // TODO: get server id from URI

  useEffect(() => {
    if (!client) return

    const list = ids.map((id) => {
      const user = client.users.get(id)
      if (user) {
        return userInformation(
          user,
          serverId ? client.serverMembers.getByKey({ server: serverId, user: user.id }) : undefined
        )
      }
      return undefined
    })

    setUsers(filterNull ? list.filter((x) => x) : list)
  }, [client, ids])

  return users
}

export function useUser(id: string) {
  const users = useUsers([id])
  return users[0] ?? { username: 'Unknown User' }
}
