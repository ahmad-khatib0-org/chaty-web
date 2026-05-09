import { MessageSystem as MessageSystemClass } from '@chaty-app/proto/web-plain/service/v1/messages_db'

import { UserMention } from '@/markdown/plugins/mentions'

interface Props {
  systemMessage: MessageSystemClass
  menuGenerator: (user?: any) => any
  isServer: boolean
  tr: {
    user_added: string
    user_remove: string
    user_left_group: string
    user_left_server: string
    user_kicked: string
    user_banned: string
    user_joined: string
    channel_renamed: string
    channel_description_changed: string
    channel_icon_changed: string
    channel_ownership_changed: string
    message_pinned: string
    message_unpinned: string
    call_started: string
    call_started_with_duration: string
    call_duration: string
  }
  params: { serverId?: string; channelId?: string }
}

// Helper to format relative time
const formatRelativeTime = (finishedAt: Date, startedAt: Date): string => {
  const diff = finishedAt.getTime() - startedAt.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) return `${hours}h ${minutes % 60}m`
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`
  return `${seconds}s`
}

export function SystemMessage({ systemMessage, isServer, tr, params }: Props) {
  // user_added
  if (systemMessage.userAdded) {
    return (
      <div className='min-h-5 flex items-center'>
        <UserMention userId={systemMessage.userAdded.id} /> {tr.user_added}{' '}
        <UserMention userId={systemMessage.userAdded.by} />
      </div>
    )
  }

  // user_remove
  if (systemMessage.userRemove) {
    return (
      <div className='min-h-5 flex items-center'>
        <UserMention userId={systemMessage.userRemove.id} /> {tr.user_remove}{' '}
        <UserMention userId={systemMessage.userRemove.by} />
      </div>
    )
  }

  // user_joined
  if (systemMessage.userJoined) {
    return (
      <div className='min-h-5 flex items-center'>
        <UserMention userId={systemMessage.userJoined.id} /> {tr.user_joined}
      </div>
    )
  }

  // user_left
  if (systemMessage.userLeft) {
    return (
      <div className='min-h-5 flex items-center'>
        <UserMention userId={systemMessage.userLeft.id} />{' '}
        {isServer ? tr.user_left_server : tr.user_left_group}
      </div>
    )
  }

  // user_kicked
  if (systemMessage.userKicked) {
    return (
      <div className='min-h-5 flex items-center'>
        <UserMention userId={systemMessage.userKicked.id} /> {tr.user_kicked}
      </div>
    )
  }

  // user_banned
  if (systemMessage.userBanned) {
    return (
      <div className='min-h-5 flex items-center'>
        <UserMention userId={systemMessage.userBanned.id} /> {tr.user_banned}
      </div>
    )
  }

  // channel_renamed
  if (systemMessage.channelRenamed) {
    return (
      <div className='min-h-5 flex items-center'>
        <UserMention userId={systemMessage.channelRenamed.by} /> {tr.channel_renamed}{' '}
        <strong>{systemMessage.channelRenamed.name}</strong>
      </div>
    )
  }

  // channel_description_changed
  if (systemMessage.channelDescriptionChanged) {
    return (
      <div className='min-h-5 flex items-center'>
        <UserMention userId={systemMessage.channelDescriptionChanged.by} /> {tr.channel_description_changed}
      </div>
    )
  }

  // channel_icon_changed
  if (systemMessage.channelIconChanged) {
    return (
      <div className='min-h-5 flex items-center'>
        <UserMention userId={systemMessage.channelIconChanged.by} /> {tr.channel_icon_changed}
      </div>
    )
  }

  // channel_ownership_changed
  if (systemMessage.channelOwnershipChanged) {
    return (
      <div className='min-h-5 flex items-center'>
        <UserMention userId={systemMessage.channelOwnershipChanged.from} /> {tr.channel_ownership_changed}{' '}
        <UserMention userId={systemMessage.channelOwnershipChanged.to} />
      </div>
    )
  }

  // message_pinned
  if (systemMessage.messagePinned) {
    const href = `${location.origin}${params.serverId ? `/server/${params.serverId}` : ''
      }/channel/${params.channelId}/${systemMessage.messagePinned.id}`
    return (
      <div className='min-h-5 flex items-center'>
        <UserMention userId={systemMessage.messagePinned.by} /> {tr.message_pinned}{' '}
        <RenderAnchor href={href} />
      </div>
    )
  }

  // message_unpinned
  if (systemMessage.messageUnpinned) {
    const href = `${location.origin}${params.serverId ? `/server/${params.serverId}` : ''
      }/channel/${params.channelId}/${systemMessage.messageUnpinned.id}`
    return (
      <div className='min-h-5 flex items-center'>
        <UserMention userId={systemMessage.messageUnpinned.by} /> {tr.message_unpinned}{' '}
        <RenderAnchor href={href} />
      </div>
    )
  }

  // call_started
  if (systemMessage.callStarted) {
    const hasFinished = systemMessage.callStarted.finishedAt != null

    if (!hasFinished) {
      return (
        <div className='min-h-5 flex items-center'>
          <UserMention userId={systemMessage.callStarted.by} /> {tr.call_started}
        </div>
      )
    }

    const duration = formatRelativeTime(
      systemMessage.callStarted.finishedAt,
      systemMessage.callStarted.startedAt
    )

    return (
      <div className='min-h-5 flex items-center'>
        <UserMention userId={systemMessage.callStarted.by} /> {tr.call_started_with_duration}{' '}
        <Tooltip content={systemMessage.callStarted.finishedAt.toLocaleString()} placement='top'>
          <span className='cursor-help'>{duration}</span>
        </Tooltip>
      </div>
    )
  }

  // text
  if (systemMessage.text) {
    return <div className='min-h-5 flex items-center'>{systemMessage.text.content}</div>
  }

  return null
}
