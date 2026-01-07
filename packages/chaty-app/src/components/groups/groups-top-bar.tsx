import { useGroupsStore } from '@/state'
import { ObjString } from '@/types/shared'

type Props = {
  tr: ObjString
}

function GroupsTopBar({ }: Props) {
  const msg = useGroupsStore((state) => state.msg)

  if (!msg) return <div className='h-12' style={{ backgroundColor: 'var(--primary-color)' }}></div>

  return <div className='h-12'></div>
}

export default GroupsTopBar
