import Image from 'next/image'
import { Tooltip } from '@mantine/core'
import { decodeTime } from 'ulid'

import { Message as MessageType, WebsiteEmbed } from 'chaty-client/models'

import { useClient } from '@/context/client'
import { MessageContainer } from './message-container'
import { Avatar, ColouredText } from '../ui'
import { MessageReply } from './message-reply'
import { ObjString } from '@/types/shared'
import { SystemMessageIcon } from '../messaging'

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
      }
    >
      {message.system &&  }
    </MessageContainer>
  )
}
