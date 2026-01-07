'use client'

import { ObjString } from '@/types/shared'
import GroupsList from '@/components/groups/groups-list'
import GroupsMessages from '@/components/groups/groups-messages'
import GroupsSidebar from '@/components/groups/groups-sidebar'
import GroupsTopBar from './groups-top-bar'

type Props = {
  tr: ObjString
}

function GroupsWrapper({ tr }: Props) {
  return (
    <div className='grid grid-cols-[20%_1fr_20%] min-h-screen'>
      <GroupsList tr={tr} />
      <div className='flex flex-col'>
        <GroupsTopBar tr={tr} />
        <GroupsMessages tr={tr} />
      </div>
      <GroupsSidebar tr={tr} />
    </div>
  )
}

export default GroupsWrapper
