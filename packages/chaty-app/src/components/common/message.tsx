import Image from 'next/image'
import { Tooltip } from '@mantine/core'
import { decodeTime } from 'ulid'

import { Message as MessageType, WebsiteEmbed } from 'chaty-client/models'

import { useClient } from '@/context/client'
import { MessageContainer } from './message-container'
import { Avatar, BreakText, ColouredText } from '../ui'
import { MessageReply } from './message-reply'
import { ObjString } from '@/types/shared'
import { SystemMessage, SystemMessageIcon } from '../messaging'
import { MessageEdit } from './message-edit'
import { Markdown } from '../markdown'
import { Attachment, Embed, Reactions } from '../messaging/elements'

/**
 * Regex for matching URLs
 */
const RE_URL = /[(http(s)?)://(www.)?a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/

interface Props {
  tr: ObjString

  /**
   * Message
   */
  message: MessageType

  /**
   * Whether this is the tail of another message
   */
  tail?: boolean

  /**
   * Whether to highlight this message
   */
  highlight: boolean

  /**
   * Whether to replace content with editor
   */
  editing: boolean

  /**
   * Whether this message is a link
   */
  isLink?: boolean
}

export function Message({ tr, highlight, tail, editing, message, isLink }: Props) {
  const client = useClient()

  /**
   * Determine whether this message only contains a GIF
   */
  const isOnlyGIF = (): boolean => {
    return (
      message.embeds.length === 1 &&
      message.embeds[0] instanceof WebsiteEmbed &&
      message.embeds[0].isGif &&
      !!message.content &&
      !message.content.replace(RE_URL, '').length
    )
  }

  function getSystemMessageTr() {
    return {
      user_added: tr.userAdded,
      user_remove: tr.userRemove,
      user_left_group: tr.userLeftGroup,
      user_left_server: tr.userLeftServer,
      user_kicked: tr.userKicked,
      user_banned: tr.userBanned,
      user_joined: tr.userJoined,
      channel_renamed: tr.channelRenamed,
      channel_description_changed: tr.channelDescriptionChanged,
      channel_icon_changed: tr.channelIconChanged,
      channel_ownership_changed: tr.channelOwnershipChanged,
      message_pinned: tr.messagePinned,
      message_unpinned: tr.messageUnpinned,
      call_started: tr.callStarted,
      call_started_with_duration: tr.callStartedWithDuration,
      call_duration: tr.callDuration,
    }
  }

  return (
    <MessageContainer
      username={
        <>
          <ColouredText colour={message.roleColour}>{message.username}</ColouredText>
        </>
      }
      avatar={
        <div className='h-fit rounded-full'>
          <Avatar size={36} src={message.avatarURL} />
        </div>
      }
      timestamp={message.createdAt}
      edited={message.editedAt ? new Date(message.editedAt) : undefined}
      mentioned={message.mentioned}
      highlight={highlight}
      editing={editing}
      isLink={isLink}
      tail={tail /* TODO: add settings.compact_mode ? ... */}
      compact={!!message.system /* TODO: add settings.compact_mode ? ... */}
      header={
        <>
          {message.replyIds.map((id) => (
            <MessageReply replyId={id} message={message} />
          ))}
        </>
      }
      info={
        <>
          {message.author?.privileged && (
            <Tooltip label={tr.officialCom}>
              <div className='relative size-4'>
                <Image src='/messaging/brightness_alert.svg' alt={'brightness icon'} fill sizes='100%' />
              </div>
            </Tooltip>
          )}
          {message.author?.bot && (
            <Tooltip label={tr.bot}>
              <div className='relative size-4'>
                <Image src='/messaging/smart_toy.svg' alt={'smart toy icon'} fill sizes='100%' />
              </div>
            </Tooltip>
          )}
          {message.webhook && (
            <Tooltip label={tr.cloud}>
              <div className='relative size-4'>
                <Image src='/messaging/cloud.svg' alt={'cloud icon'} fill sizes='100%' />
              </div>
            </Tooltip>
          )}
          {message.webhook && (
            <Tooltip label={tr.silent}>
              <div className='relative size-4'>
                <Image
                  src='/messaging/notifications_off.svg'
                  alt={'notifications off icon'}
                  fill
                  sizes='100%'
                />
              </div>
            </Tooltip>
          )}
          {
            // Check if less than 1 day (24 hours = 86,400,000 milliseconds)
            message.authorId && Date.now() - decodeTime(message.authorId) < 86400000 && (
              <Tooltip label={tr.newToChaty}>
                <div className='relative size-4'>
                  <Image src='/messaging/spa.svg' alt={'spa icon'} fill sizes='100%' />
                </div>
              </Tooltip>
            )
          }
        </>
      }
      infoMatch={
        message.system && (
          <SystemMessageIcon
            systemMessage={message.system}
            createdAt={message.createdAt}
            isServer={!!message.server}
          />
        )
      }>
      {message.system && (
        <SystemMessage
          systemMessage={message.system}
          isServer={!!message.server}
          menuGenerator={() => <></>}
          params={{}}
          tr={getSystemMessageTr()}
        />
      )}
      {editing && <MessageEdit />}
      {message.content && !isOnlyGIF() && (
        <BreakText>
          <Markdown content={message.content} />
        </BreakText>
      )}
      {message.attachments && (
        <>
          {message.attachments.map((att) => (
            <Attachment message={message} file={att} tr={tr} />
          ))}
        </>
      )}
      {message.embeds.map((embed) => (
        <Embed embed={embed} tr={tr} />
      ))}
      <Reactions
        reactions={message.username as never as Map<string, Set<string>>}
        interactions={message.interactions}
        userId={client.user?.id}
        addReaction={() => { }}
        removeReaction={() => { }}
        sendGIF={(content) => {
          /* TODO: handle sent gif: sendMessage({ content, replies: [{ id: message.id, mention: true }] }) */
        }}
      />
    </MessageContainer>
  )
}
