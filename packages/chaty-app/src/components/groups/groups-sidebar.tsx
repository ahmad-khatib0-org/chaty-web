import { ObjString } from '@/types/shared'
import MessagesSearch from '../common/messages-search'
import { useGroupsStore } from '@/state'

type Props = {
  tr: ObjString
}

function GroupsSidebar({ tr }: Props) {
  const msg = useGroupsStore((state) => state.msg)

  if (!msg)
    return (
      <div
        className='h-12 flex justify-center items-center'
        style={{ backgroundColor: 'var(--primary-color)' }}
      />
    )

  return (
    <div className='flex flex-col'>
      <div
        className='h-12 flex justify-center items-center'
        style={{ backgroundColor: 'var(--primary-color)' }}>
        <MessagesSearch onSubmit={(value) => console.log(value)} placehoder={tr.searchMessages} />
      </div>
    </div>
  )
}

export default GroupsSidebar
