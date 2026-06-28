import { IconFile } from '@tabler/icons-react'

import { Message } from 'chaty-client/models'

import { renderSimpleMarkdown } from '../markdown'
import { Avatar, ColouredText } from '../ui'
import { ObjString } from '@/types/shared'

interface Props {
  tr: ObjString
  /**
   * Message that was replied to
   */
  message?: Message
  /**
   * Whether it was mentioned
   */
  mention?: boolean
  /**
   * Whether to hide the left side reply indicator
   */
  noDecorations?: boolean
}

const renderReplyContent = (content: string) => {
  if (content.length > 128) {
    content = content.slice(0, 128) + '...'
  }
  return renderSimpleMarkdown(content.replace(/\n/g, ' '))
}

export function MessageReply({ message, mention, noDecorations, tr }: Props) {
  if (!message) {
    return (
      <div
        className={`flex items-center gap-2 flex-1 min-w-0 ${!noDecorations ? 'before:content-[""] before:block before:w-5.5 before:h-3 before:shrink-0 before:self-end before:rounded-tl-sm before:border-l-2 before:border-t-2 before:border-(--md-sys-color-outline-variant) before:mr-1.5 before:ml-7.5' : ''}`}>
        <p>{tr.msgCouldntLoad}</p>
      </div>
    )
  }

  if (message.author?.relationship === 'Blocked') {
    return (
      <div
        className={`flex items-center gap-2 flex-1 min-w-0 ${!noDecorations ? 'before:content-[""] before:block before:w-5.5 before:h-3 before:shrink-0 before:self-end before:rounded-tl-sm before:border-l-2 before:border-t-2 before:border-(--md-sys-color-outline-variant) before:mr-1.5 before:ml-7.5' : ''}`}>
        <p>{tr.blockedUser}</p>
      </div>
    )
  }

  return (
    <div
      className={`flex items-center gap-2 flex-1 min-w-0 text-(--md-sys-color-on-surface) [&_a:link]:no-underline ${!noDecorations ? 'before:content-[""] before:block before:w-5.5 before:h-3 before:shrink-0 before:self-end before:rounded-tl-sm before:border-l-2 before:border-t-2 before:border-(--md-sys-color-outline-variant) before:mr-1.5 before:ml-7.5' : ''}`}>
      <div className='flex items-center gap-2 cursor-pointer'>
        <Avatar src={message.avatarURL} size={14} />
        <div className='text-nowrap *:text-nowrap'>
          <ColouredText colour={message.roleColour}>{(mention ? '@' : '') + message.username}</ColouredText>
        </div>
      </div>

      <a href={message.id /*  TODO: add the path*/} className='flex items-center gap-4 flex-1 min-w-0'>
        {message.attachments && (
          <em className='inline-flex items-center gap-2 whitespace-nowrap'>
            <IconFile size={16} />
            {message.attachments.length > 1 ? <p>{tr.sentMultiAttachments}</p> : <p>{tr.sentAnAttachment}</p>}
          </em>
        )}

        {message.content && (
          <div className='flex overflow-hidden items-center whitespace-nowrap text-ellipsis'>
            {renderReplyContent(message.content)}
          </div>
        )}
      </a>
    </div>
  )
}
