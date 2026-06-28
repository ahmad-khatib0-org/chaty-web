import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { decodeTime, ulid } from 'ulid'
import { Text } from '@mantine/core'
import { IconPin, IconSearch, IconX } from '@tabler/icons-react'

import { MessagesGetRequest, MessageSort } from '@chaty-app/proto/web-plain/service/v1/messages'
import { Channel as ChannelType } from 'chaty-client/models'
import { useSmartParams } from '@/lib/client'
import { LAYOUT_SECTIONS, useLayoutStore } from '@/state'
import { useClient } from '@/context/client'
import { Keybind, KeybindAction, useKeybind } from '@/lib/client/keybinds'
import { Header, main } from '../ui'
import { ChannelHeader } from './channel-header'
import { ObjString } from '@/types/shared'
import { VoiceChannelCallCardMount } from '../messaging/voice'
import { NewMessages } from '../messaging/new-messages'
import Messages from './messages'
import { MessageComposition, TypingIndicator } from '../messaging/composition'
import { MembersSidebar, MessageSearchSidebar } from '../messaging'
import { MessagesDraft } from '../messaging/messages-draft'

type Props = {
  tr: ObjString
  channel: ChannelType
}

export type SidebarState =
  | {
    state: 'search'
    query: string
  }
  | {
    state: 'pins'
  }
  | {
    state: 'default'
  }

export function Channel({ channel, tr }: Props) {
  const router = useRouter()

  // Sidebar state
  const [sidebarState, setSidebarState] = useState<SidebarState>({ state: 'default' })

  const [lastId, setLastId] = useState<undefined | string>()

  // Get a reference to the message box's load latest function
  const jumpToBottomRef = useRef<() => void | null>(null)

  // Get a reference to the message list's "end status"
  const atEndRef = useRef<(() => boolean) | null>(null)

  // Sidebar scroll target
  const sidebarScrollTargetRef = useRef(null)

  const getSectionState = useLayoutStore((state) => state.getSectionState)
  const client = useClient()
  const params = useSmartParams()

  /**
   * Message id to be highlighted
   * @returns Message Id
   */
  const highlightMessageId = () => params.messageId

  const showSidebar =
    (getSectionState(LAYOUT_SECTIONS.MEMBER_SIDEBAR, true) && !channel.saved) ||
    sidebarState.state !== 'default'

  function buildSearchMessagesRequest(): MessagesGetRequest {
    // TODO: build the request
    return { channelId: channel.id }
  }

  // Reset sidebar state when channel changes
  useEffect(() => {
    setSidebarState({ state: 'default' })
  }, [channel.id])

  // Store last unread message id
  useEffect(() => {
    setLastId(channel.unread ? client.channelUnreads.get(channel.id)?.lastMessageId : undefined)
  }, [channel.id, channel.unread])

  // Mark channel as read whenever it is marked as unread
  useEffect(() => {
    if (channel.unread && (atEndRef.current ? atEndRef.current : true)) {
      if (document.hasFocus()) {
        channel.ack()
      } else {
        if (!lastId) setLastId(ulid(decodeTime(channel.lastMessageId ?? '') - 1))
      }
    }
  }, [channel.unread, channel.lastMessageId, lastId])

  const onFocus = useCallback(() => {
    if (channel.unread && (atEndRef.current ? atEndRef.current : true)) {
      channel.ack()
    }
  }, [channel])

  useEffect(() => {
    document.addEventListener('focus', onFocus)
    return () => document.removeEventListener('focus', onFocus)
  }, [onFocus])

  useKeybind(KeybindAction.CHAT_JUMP_END, () => {
    // Mark channel as read if not already
    if (channel.unread) channel.ack()

    // Clear the last unread id
    if (lastId) setLastId(undefined)

    // Scroll to the bottom
    jumpToBottomRef?.current?.()
  })

  return (
    <>
      <Header placement='primary'>
        <ChannelHeader
          channel={channel}
          sidebarState={sidebarState}
          setSidebarState={setSidebarState}
          tr={{
            addFriendsToGrp: tr.addFriendsToGrp,
            channelSettings: tr.channelSettings,
            clickToShowChanInfo: tr.clickToShowChanInfo,
            savedNotes: tr.savedNotes,
            searchMessages: tr.searchMessages,
            viewPinned: tr.viewPinned,
          }}
        />
      </Header>
      <div className='flex flex-row flex-1 min-w-0 min-h-0'>
        <main className={main()}>
          {channel.isVoice && <VoiceChannelCallCardMount channel={channel} />}

          {!channel.isVoice && (
            <div className='relative z-10 [&>div]:w-full [&>div]:absolute [&>div]:top-(--gap-md)'>
              <NewMessages
                lastId={lastId}
                jumpBack={() => (lastId ? router.push(lastId) : null)}
                dismiss={() => setLastId(undefined)}
                tr={{ jumpToBeginning: tr.jumpToBeginning }}
              />
            </div>
          )}

          <Messages
            channel={channel}
            limit={150}
            lastReadId={lastId}
            pendingMessages={(props) => (
              <MessagesDraft tr={tr} tail={props.tail} sentIds={props.ids} channel={channel} />
            )}
            typingIndicator={<TypingIndicator users={channel.typing} ownId={client.user?.id ?? ''} tr={tr} />}
            highlightedMessageId={highlightMessageId()}
            clearHighlightedMessage={() => router.back()}
            atEndRef={(ref) => (atEndRef.current = ref)}
            jumpToBottomRef={(ref) => (jumpToBottomRef.current = ref)}
            tr={tr}
          />
          <MessageComposition tr={tr} channel={channel} onMessageSend={() => jumpToBottomRef.current?.()} />
        </main>
        {showSidebar && (
          <div
            ref={sidebarScrollTargetRef}
            className={`
              shrink-0 overflow-y-auto hover:overflow-y-auto
              ${sidebarState.state !== 'default' ? 'w-90' : 'w-(--layout-width-channel-sidebar)'}
            `}
            style={{
              scrollbarWidth: 'thin',
            }}>
            {sidebarState.state === 'search' && (
              <div className='pr-4 w-90'>
                <div className='p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700'>
                  <div className='flex items-center gap-2'>
                    <IconSearch className='w-5 h-5' />
                    <p>{tr.searchResults}</p>
                  </div>
                  <button
                    onClick={() => setSidebarState({ state: 'default' })}
                    className='p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded'>
                    <IconX className='w-5 h-5' />
                  </button>
                </div>
                <MessageSearchSidebar query={buildSearchMessagesRequest()} channel={channel} tr={tr} />
              </div>
            )}

            {sidebarState.state === 'pins' && (
              <div className='pr-4 w-90'>
                <div className='p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700'>
                  <div className='flex items-center gap-2'>
                    <IconPin className='w-5 h-5' />
                    <Text size='large'>Pinned Messages</Text>
                  </div>
                  <button
                    onClick={() => setSidebarState({ state: 'default' })}
                    className='p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded'>
                    <IconX className='w-5 h-5' />
                  </button>
                </div>
                <MessageSearchSidebar
                  channel={channel}
                  query={{ ...buildSearchMessagesRequest(), sort: MessageSort.MESSAGE_SORT_LATEST }}
                  tr={tr}
                />
              </div>
            )}

            {sidebarState.state === 'default' && sidebarScrollTargetRef.current && (
              <MembersSidebar
                channel={channel}
                scrollTargetElement={sidebarScrollTargetRef.current}
                tr={{
                  busy: tr.busy,
                  focus: tr.focus,
                  idle: tr.idle,
                  members: tr.members,
                  membersOnline: tr.membersOnline,
                  offline: tr.offline,
                  online: tr.online,
                }}
              />
            )}

            {sidebarState.state !== 'default' && (
              <Keybind
                keybind={KeybindAction.CLOSE_SIDEBAR}
                onPressed={() => setSidebarState({ state: 'default' })}
              />
            )}
          </div>
        )}
      </div>
    </>
  )
}
