import { IconAt, IconX } from '@tabler/icons-react'

import { Message } from 'chaty-client/models'
import { MessageReply } from './message-reply'
import { ObjString } from '@/types/shared'

interface Props {
  tr: ObjString
  /**
   * Message to display
   */
  message?: Message

  /**
   * Whether we are mentioning this message
   */
  mention: boolean

  /**
   * Whether this is our own message and we should hide mention option
   */
  self: boolean

  /**
   * Toggle the mention
   */
  toggle: () => void

  /**
   * Dismiss the mention
   */
  dismiss: () => void
}

export function MessageReplyPreview({ message, self, dismiss, mention, toggle, tr }: Props) {
  return (
    <div className='flex items-center gap-4 text-[0.8em] select-none mb-4 py-2 px-4 rounded-(--borderRadius-lg) bg-(--md-sys-color-primary-container) text-(--md-sys-color-on-primary-container) [&_a:hover]:filter [&_a:hover]:brightness-110'>
      <span className='shrink-0'>
        <p>{tr.replyingTo}</p>
      </span>

      <MessageReply message={message} noDecorations tr={tr} />

      <div className='flex items-center gap-4 ml-auto'>
        {!self && (
          <a
            className={`flex shrink-0 items-center flex-row uppercase gap-2 cursor-pointer ${!mention ? 'text-(--md-sys-color-outline)' : ''}`}
            onClick={toggle}>
            <IconAt size={16} />
            {mention ? <p>{tr.on}</p> : <p>{tr.off}</p>}
          </a>
        )}

        <a className='grid place-items-center cursor-pointer' onClick={dismiss}>
          <IconX size={16} />
        </a>
      </div>
    </div>
  )
}
