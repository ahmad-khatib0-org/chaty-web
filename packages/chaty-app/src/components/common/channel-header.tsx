import { ActionIcon, TextInput, Tooltip } from '@mantine/core'
import {
  IconGrid3x3,
  IconMail,
  IconNote,
  IconPin,
  IconSettings,
  IconUserPlus,
  IconUsers,
} from '@tabler/icons-react'

import { Channel } from 'chaty-client/models'
import { SidebarState } from './channel'
import { TextWithEmoji } from '../markdown/emoji/text-with-emoji'
import { HeaderIcon, OverflowingText, UserStatus } from '../ui'
import { LAYOUT_SECTIONS, useLayoutStore } from '@/state'

interface Props {
  tr: {
    clickToShowChanInfo: string
    savedNotes: string
    channelSettings: string
    addFriendsToGrp: string
    viewPinned: string
    searchMessages: string
  }
  /**
   * Channel to render header for
   */
  channel: Channel

  /**
   * Sidebar state
   */
  sidebarState?: SidebarState

  /**
   * Set sidebar state
   */
  setSidebarState?: React.Dispatch<React.SetStateAction<SidebarState>>
}

/**
 * Common channel header component
 */
export function ChannelHeader({ channel, setSidebarState, sidebarState, tr }: Props) {
  const { toggleSectionState, setOpenSection } = useLayoutStore()

  const searchValue = sidebarState?.state === 'search' ? sidebarState.query : ''

  return (
    <div className='flex items-center gap-2 flex-1 min-w-0'>
      {(channel.text || channel.group) && (
        <>
          <div className='flex items-center justify-center w-8 h-8'>
            <HeaderIcon>
              <IconGrid3x3 size={20} />
            </HeaderIcon>
          </div>
          <Tooltip label={tr.clickToShowChanInfo} position='bottom'>
            <div
              className='text-nowrap *:text-nowrap font-semibold text-base cursor-pointer hover:underline'
              onClick={() => { } /*  TODO: open a channel info model */}>
              <TextWithEmoji content={channel.name} />
            </div>
          </Tooltip>
          {channel.description && (
            <>
              <div className='h-5 mx-1 px-px bg-gray-300 dark:bg-gray-700' />
              <Tooltip label='Click to show full description' position='bottom'>
                <a
                  className='min-w-0 cursor-pointer'
                  onClick={() => { } /*  TODO: open a channel info model */}>
                  <OverflowingText>
                    <TextWithEmoji content={channel.description!.split('\n').shift() ?? ''} />
                  </OverflowingText>
                </a>
              </Tooltip>
            </>
          )}
        </>
      )}

      {channel.direct && (
        <>
          <HeaderIcon>
            <IconMail size={20} />
          </HeaderIcon>
          <TextWithEmoji content={channel.recipient?.username ?? ''} />
          <UserStatus status={channel.recipient?.presence} size='8px' />
        </>
      )}

      {channel.saved && (
        <>
          <HeaderIcon>
            <IconNote />
          </HeaderIcon>
          <span>{tr.savedNotes}</span>
        </>
      )}

      {/* Channel Settings */}
      {(channel.group || channel.serverId) && channel.orPermission('ManageChannel', 'ManagePermissions') && (
        <Tooltip label={tr.channelSettings}>
          <ActionIcon
            variant='subtle'
            onClick={() => {
              /* TODO: open channel settings */
            }}>
            <IconSettings size={20} />
          </ActionIcon>
        </Tooltip>
      )}

      {/* Add members to group */}
      {channel.group && (
        <Tooltip label={tr.addFriendsToGrp} position='bottom'>
          <ActionIcon
            variant='subtle'
            onClick={() => {
              /* TODO: add the model */
            }}>
            <IconUserPlus size={20} />
          </ActionIcon>
        </Tooltip>
      )}

      {/* Pinned messages */}
      {sidebarState && (
        <Tooltip label={tr.viewPinned} position='bottom'>
          <ActionIcon
            variant='subtle'
            onClick={() =>
              setSidebarState?.(sidebarState?.state === 'pins' ? { state: 'default' } : { state: 'pins' })
            }>
            <IconPin size={20} />
          </ActionIcon>
        </Tooltip>
      )}

      {/* View members */}

      {sidebarState && !channel.saved && (
        <Tooltip label='View members' position='bottom'>
          <ActionIcon
            variant='subtle'
            onClick={() => {
              if (sidebarState?.state === 'default') {
                toggleSectionState(LAYOUT_SECTIONS.MEMBER_SIDEBAR, true)
              } else {
                setOpenSection(LAYOUT_SECTIONS.MEMBER_SIDEBAR, true, true)
                setSidebarState?.({ state: 'default' })
              }
            }}>
            <IconUsers size={20} />
          </ActionIcon>
        </Tooltip>
      )}

      {/* Search input */}
      {sidebarState !== undefined && (
        <TextInput
          placeholder={tr.searchMessages}
          value={searchValue}
          onChange={(e) =>
            e.currentTarget.value
              ? setSidebarState?.({ state: 'search', query: e.currentTarget.value })
              : setSidebarState?.({ state: 'default' })
          }
          className='w-60'
          classNames={{
            input: 'h-10 px-4 rounded-full bg-[var(--md-sys-color-surface-container-high)]',
          }}
        />
      )}
    </div>
  )
}
