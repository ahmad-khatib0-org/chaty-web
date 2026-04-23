'use client'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

import { GroupsListItem as GroupsListItemType } from '@chaty-app/proto/web/service/v1/groups_pb'
import { ObjString } from '@/types/shared'
import { useGroupsStore } from '@/state'

type Props = {
  item: GroupsListItemType
  tr: ObjString
}

function GroupsListItem({ item, tr }: Props) {
  const group = item.group
  const router = useRouter()
  const setCurrentGroup = useGroupsStore((state) => state.setCurrentGroup)

  const memberCount = group?.recipients.length

  const onSelect = (msg: GroupsListItemType) => {
    setCurrentGroup(msg)
    router.push(`/groups?id=${msg.id}`)
  }

  if (!group) return null

  return (
    <div
      onClick={() => onSelect(item)}
      className='flex items-center gap-4 px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 cursor-pointer'>
      {group.icon && (
        <div className='w-12 h-12 rounded-full shrink-0 overflow-hidden'>
          <Image
            src={group.icon.id}
            alt={group.name}
            width={48}
            height={48}
            className='w-full h-full object-cover'
          />
        </div>
      )}
      {!group.icon && (
        <div className='size-9 rounded-full bg-blue-500 flex items-center justify-center shrink-0 text-white font-semibold text-sm'>
          {group.name.charAt(0).toUpperCase()}
        </div>
      )}

      <div className='flex-1 min-w-0'>
        <p className='text-sm font-medium text-gray-900 truncate'>{group.name}</p>
        <p className='text-xs text-gray-500'>
          {memberCount} {memberCount === 1 ? tr.member : tr.members}
        </p>
      </div>
    </div>
  )
}

export default GroupsListItem
