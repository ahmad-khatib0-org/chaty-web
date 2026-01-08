import { Tooltip } from '@mantine/core'

import { ObjString } from '@/types/shared'
import GroupsCreate from './groups-create'

type Props = {
  tr: ObjString
}

function GroupsList({ tr }: Props) {
  return (
    <div className='flex flex-col'>
      <div
        className='h-12 flex justify-between items-center px-4'
        style={{ backgroundColor: 'var(--primary-color)' }}>
        <p className='text-white font-medium text-xl'>{tr.myGroups}</p>
        <Tooltip label={tr.create} position='bottom'>
          <GroupsCreate tr={tr} />
        </Tooltip>
      </div>
    </div>
  )
}

export default GroupsList
