import { useGroupsStore } from '@/state'
import { ObjString } from '@/types/shared'

type Props = {
  tr: ObjString
}

function GroupsTopBar({ }: Props) {
  const group = useGroupsStore((state) => state.currentGroup)

  if (!group) return <div className='h-12' style={{ backgroundColor: 'var(--primary-color)' }}></div>

  return <div className='h-12' style={{ backgroundColor: 'var(--primary-color)' }}></div>
}

export default GroupsTopBar
