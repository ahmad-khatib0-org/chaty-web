import { useEffect, useState } from 'react'
import { isValid } from 'ulid'
import { useSearchParams } from 'next/navigation'
import { notifications } from '@mantine/notifications'
import { Loader } from '@mantine/core'

import { ObjString } from '@/types/shared'
import { useAppStore, useGroupsStore } from '@/state'
import { grpcClient, handleGrpcErr } from '@/lib/client'

type Props = {
  tr: ObjString
}

function GroupsMessages({ }: Props) {
  const search = useSearchParams()
  const [loading, setLoading] = useState(false)
  const setChannel = useGroupsStore((state) => state.setChannel)
  const info = useAppStore((state) => state.clientInfo)
  const channel = useGroupsStore((state) => state.channel)

  const getGroup = async (id: string) => {
    if (loading) return
    await new Promise((res) => setTimeout(() => res(''), 2999))
    setLoading(true)
    try {
      const result = (await grpcClient().channelsGet({ id })).response
      if (result.case === 'data') {
        console.log(result.value)
        setChannel(result.value)
      }
      if (result.case === 'error') {
        notifications.show({ message: result.value.message, color: 'red', position: 'top-right' })
      }
    } catch (err) {
      const message = handleGrpcErr(err, info.languageSymbol)
      notifications.show({ message, color: 'red', position: 'top-right' })
    } finally {
      setLoading(false)
    }
  }

  const onChange = async () => {
    const id = search.get('id') ?? ''
    if (isValid(id) && (!channel || channel.id != id)) await getGroup(id)
  }

  useEffect(() => {
    onChange()
    return () => { }
  }, [search])

  if (loading) return <Loader />

  if (!channel && !loading) return <div className='h-12'>select a group to start chatting</div>

  if (channel && !loading) {
    return <div className=''>there is a group , and created at : {channel.createdAt}</div>
  }
}

export default GroupsMessages
