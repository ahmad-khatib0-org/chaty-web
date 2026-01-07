import { Tooltip } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'

import { ObjString } from '@/types/shared'

type Props = {
  tr: ObjString
}

function GroupsList({ tr }: Props) {
  return (
    <div className='flex flex-col'>
      <div
        className='h-12 flex justify-between items-center'
        style={{ backgroundColor: 'var(--primary-color)' }}>
        <p className='text-white font-medium text-xl'>{tr.myGroups}</p>
        <Tooltip label={tr.create} position='bottom'>
          <IconPlus size={28} color='white' className='cursor-pointer' />
        </Tooltip>
      </div>
    </div>
  )
}

export default GroupsList
