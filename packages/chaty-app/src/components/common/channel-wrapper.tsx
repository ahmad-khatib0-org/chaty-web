import { useMemo } from 'react'

import { useClient } from '@/context/client'
import { useSmartParams } from '@/lib/client'
import { ChannelAgeRestricted } from './channel-age-restricted'
import { ObjString } from '@/types/shared'
import { Channel } from './channel'

interface Props {
  tr: ObjString
}

export function ChannelWrapper({ tr }: Props) {
  const params = useSmartParams()
  const client = useClient()
  const channel = useMemo(() => client.channels.get(params.channelId ?? ''), [params.channelId])

  if (!channel) return null

  return (
    <div className='min-w-0 flex-1 flex relative flex-col'>
      <ChannelAgeRestricted
        enabled={channel.mature}
        contentId={channel.id}
        contentName={'#' + channel.id}
        tr={{
          confirmAge: tr.confirmAge,
          enterChannel: tr.enterChannel,
          back: tr.back,
          matureChannel: tr.chanMarkedMature,
          chanNotAvailable: tr.chanNotAvailable,
          chanNotAvailableRegion: tr.chanNotAvailableRegion,
        }}>
        <Channel tr={tr} channel={channel} />
      </ChannelAgeRestricted>
    </div>
  )

  return <div></div>
}
