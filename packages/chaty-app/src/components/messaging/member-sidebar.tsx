import { useEffect, useMemo, useRef, useState } from 'react'
import { CellComponentProps, Grid } from 'react-window'
import { Group, Tooltip } from '@mantine/core'

import { useClient } from '@/context/client'
import { Channel, ServerMember, User } from 'chaty-client/models'
import { Avatar, UserStatus } from '../ui'
import { userInformation } from '@/context'
import { TextWithEmoji } from '../markdown/emoji/text-with-emoji'

interface Props {
  channel: Channel
  scrollTargetElement: HTMLDivElement
  tr: {
    membersOnline: string
    members: string
    online: string
    busy: string
    focus: string
    idle: string
    offline: string
  }
}

export function MembersSidebar({ channel, tr, scrollTargetElement }: Props) {
  if (channel.group) {
    return <GroupMemberSidebar channel={channel} tr={tr} scrollTargetElement={scrollTargetElement} />
  }
  if (channel.text) {
    return <ServerMemberSidebar channel={channel} tr={tr} scrollTargetElement={scrollTargetElement} />
  }
}

/**
 * Servers to not fetch all members for (E,g Chaty main channel)
 */
const IGNORE_ALL = []

export function ServerMemberSidebar({ channel, tr, scrollTargetElement }: Props) {
  const client = useClient()
  const containerRef = useRef<HTMLDivElement>(scrollTargetElement)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (channel.serverId) {
      // TODO: add syncMembers function
      // channel.server.syncMembers(IGNORE_ALL.includes(serverId) ? true : false)
    }
  }, [channel.serverId])

  useEffect(() => {
    if (!containerRef.current) return
    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      setDimensions({ height, width })
    })

    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  const members = useMemo(() => {
    return client.serverMembers.filter((member) => member.id.server === channel.serverId)
  }, [channel.serverId])

  const hoistedRoles = useMemo(() => {
    return channel.server?.orderedRoles.filter((role) => role.hoist)
  }, [channel.server])

  const filteredMembers = useMemo(() => {
    if (channel.potentiallyRestrictedChannel) {
      return members.filter((member) => member.hasPermission(channel, 'ViewChannel'))
    }
    return members
  }, [members, channel])

  const roles = useMemo(() => {
    const byRole: Record<string, ServerMember[]> = { default: [], offline: [] }
    hoistedRoles?.forEach((role) => (byRole[role.id] = []))

    for (const member of filteredMembers) {
      if (!member.user?.online) {
        byRole['offline'].push(member)
        continue
      }

      if (member.roles.length) {
        let assigned = false
        for (const hoistedRole of hoistedRoles ?? []) {
          if (member.roles.includes(hoistedRole.id)) {
            byRole[hoistedRole.id].push(member)
            assigned = true
            break
          }
        }
        if (assigned) continue
      }

      byRole['default'].push(member)
    }

    const result = [
      ...(hoistedRoles?.map((role) => ({
        role,
        members: byRole[role.id] || [],
      })) ?? []),
      {
        role: { id: 'default', name: 'Online' },
        members: byRole['default'] || [],
      },
      {
        role: { id: 'offline', name: 'Offline' },
        members: byRole['offline'] || [],
      },
    ].filter((entry) => entry.members.length > 0)

    return result.map((entry) => ({
      ...entry,
      members: [...entry.members].sort(
        (a, b) => (a.nickname ?? a.user?.id)?.localeCompare(b.nickname ?? b.user?.displayName ?? '') || 0
      ),
    }))
  }, [filteredMembers, hoistedRoles])

  // Flatten into a single list
  const elements = useMemo(() => {
    const elements: ({ t: 0; name: string; count: number } | { t: 1; member: ServerMember })[] = []

    for (const role of roles) {
      elements.push({ t: 0, name: role.role.name, count: role.members.length })
      for (const member of role.members) elements.push({ t: 1, member })
    }

    return elements
  }, [roles])

  const onlineCount = members.filter((m) => m.user?.online).length

  const Cell = ({
    columnIndex,
    data,
    rowIndex,
    style,
  }: CellComponentProps<{
    data: (
      | {
        t: 0
        name: string
        count: number
      }
      | {
        t: 1
        member: ServerMember
      }
    )[]
  }>) => {
    const index = rowIndex * 1 + columnIndex
    if (index >= data.length) return null
    const item = data[index]

    return (
      <div style={{ ...style, width: '100%' }}>
        {item.t === 0 ? (
          <div className='pt-7 px-3.5 pb-0 text-(--md-sys-color-on-surface) text-xs font-medium'>
            {item.name} – {item.count}
          </div>
        ) : (
          <Member member={item.member} tr={tr} />
        )}
      </div>
    )
  }

  return (
    <div ref={containerRef} className='pr-4 [var(--layout-width-channel-sidebar)] h-full overflow-auto'>
      <div className='mt-3 ml-3.5 -mb-3 text-(--md-sys-color-on-surface) text-xs font-medium'>
        <Group align='center'>
          <UserStatus size='0.7em' status='Online' />
          {onlineCount} {tr.membersOnline}
        </Group>

        {dimensions.width > 0 && (
          <Grid
            columnCount={1}
            columnWidth={dimensions.width}
            rowCount={elements.length}
            rowHeight={42}
            cellComponent={Cell}
            cellProps={{ data: elements }}
          />
        )}
      </div>
    </div>
  )
}

export function GroupMemberSidebar({ channel, tr, scrollTargetElement }: Props) {
  const containerRef = useRef<HTMLDivElement>(scrollTargetElement)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (!containerRef.current) return
    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      setDimensions({ width, height })
    })
    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  const recipients = useMemo(() => {
    return channel.recipients.toSorted((a, b) => a.displayName.localeCompare(b.displayName))
  }, [channel.recipients])

  const CellComponent = ({ columnIndex, rowIndex, style, data }: CellComponentProps<{ data: User[] }>) => {
    const index = rowIndex * 1 + columnIndex
    if (index >= data.length) return null
    return (
      <div style={{ ...style, width: '100%' }}>
        <Member user={data[index]} tr={tr} />
      </div>
    )
  }

  return (
    <div ref={containerRef} className='pr-4 w-(--layout-width-channel-sidebar) h-full overflow-auto'>
      <div className='mt-3 ml-3.5 text-(--md-sys-color-on-surface) text-xs font-medium'>
        {channel.recipientIds.size} {tr.members}
      </div>

      {dimensions.width > 0 && (
        <Grid
          columnCount={1}
          columnWidth={dimensions.width}
          rowCount={recipients.length}
          rowHeight={42}
          cellComponent={CellComponent}
          cellProps={{ data: recipients }}
        />
      )}
    </div>
  )
}

function Member({ user, member, tr }: { user?: User; member?: ServerMember; tr: Props['tr'] }) {
  const userInfo = userInformation((user ?? member?.user)!, member)
  const presence = (user ?? member?.user)?.presence

  const getStatusText = () => {
    if (!presence) return tr.offline
    switch (presence) {
      case 'Online':
        return tr.online
      case 'Busy':
        return tr.busy
      case 'Focus':
        return tr.focus
      case 'Idle':
        return tr.idle
      default:
        return tr.offline
    }
  }

  return (
    <div className='cursor-pointer hover:bg-(--md-sys-color-surface-hover) rounded-lg'>
      <div className='flex items-center gap-3 px-3 py-1.5 h-10.5'>
        <div className='relative'>
          <Avatar src={userInfo.avatar} size={32} holepunch='bottom-right' />
          <div className='absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-(--md-sys-color-surface)'>
            <div
              className={`w-full h-full rounded-full bg-[var(--brand-presence-${presence?.toLowerCase() || 'invisible'})]`}
            />
          </div>
        </div>

        <div className='flex flex-col justify-center h-full min-w-0 flex-1'>
          <div className='truncate text-sm font-medium text-(--md-sys-color-on-surface)'>
            {userInfo.username}
          </div>
          {presence && (
            <Tooltip label={<TextWithEmoji content={getStatusText()} />} position='top-start'>
              <div className='truncate text-xs text-(--md-sys-color-on-surface-variant)'>
                <TextWithEmoji content={getStatusText()} />
              </div>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  )
}
