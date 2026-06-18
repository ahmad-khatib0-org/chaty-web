import { useMemo } from 'react'
import { Text } from '@mantine/core'

import { User } from 'chaty-client/models'
import { useUsers } from '@/context'
import { tr as trans } from '@/lib/client'
import { ObjString } from '@/types/shared'
import { useAppStore } from '@/state'
import { Avatar } from '@/components/ui'

interface Props {
  /**
   * Users who are typing
   */
  users: (User | undefined)[]

  /**
   * Own user ID
   */
  ownId: string

  tr: ObjString
}

/**
 * Display typing user information
 */
export function TypingIndicator(props: Props) {
  const { languageSymbol } = useAppStore((state) => state.clientInfo)

  /**
   * Generate list of user IDs
   */
  const typingUsers = useMemo(() => {
    return (
      props.users.filter(
        (user) => typeof user !== 'undefined' && user.id !== props.ownId && user.relationship !== 'Blocked'
      ) as User[]
    ).sort((a, b) => a.id.toUpperCase().localeCompare(b.id.toUpperCase()))
  }, [props.users, props.ownId])

  const userIds = typingUsers.map((user) => user.id)
  const users = useUsers(userIds, true)

  if (users.length === 0) return null

  const getTypingText = () => {
    if (users.length === 1) {
      return trans(languageSymbol, 'chat.typing.single', { Username: users[0]?.username })
    }
    if (users.length < 5) {
      const names = users
        .slice(0, -1)
        .map((user) => user!.username)
        .join(', ')
      const lastName = users.slice(-1)[0]!.username
      return trans(languageSymbol, 'chat.typing.multiple', { Names: names, Lastname: lastName })
    }

    return trans(languageSymbol, 'chat.typing.several')
  }

  return (
    <div className='w-full min-h-6.5 px-4 py-1 rounded-lg flex gap-4 select-none items-center text-(--md-sys-color-on-surface)'>
      <div className='flex shrink-0 h-fit'>
        {users.map((user, index) => (
          <div key={user?.user?.id} className={index !== users.length - 1 ? '-ml-1.5' : ''}>
            <Avatar
              src={user?.avatar}
              size={15}
              holepunch={index + 1 < users.length ? 'overlap-subtle' : 'none'}
            />
          </div>
        ))}
      </div>
      <Text size='sm' className='truncate'>
        {getTypingText()}
      </Text>
    </div>
  )
}
