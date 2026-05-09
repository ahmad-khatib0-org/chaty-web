import { ReactNode } from 'react'

import { Message } from 'chaty-client/models'
import { MessageToolbar } from '../messaging'
import { OverflowingText, Ripple } from '../ui'
import { Tooltip } from '@mantine/core'

interface Props {
  /**
   * Whether this is the tail of another message
   */
  tail?: boolean

  /**
   * Whether to move the username and related to the left
   *
   * If you want to hide it completely, add a <Match when={true} /> to infoMatch
   */
  compact?: boolean

  /**
   * Whether this message should be treated as a link
   */
  isLink?: boolean | 'hide'

  message?: Message

  /**
   * Avatar URL
   */
  avatar: ReactNode

  /**
   * Username element
   */
  username: ReactNode

  /**
   * Message content
   */
  children: ReactNode

  /**
   * Message header
   */
  header?: ReactNode

  /**
   * Message info line
   */
  info?: ReactNode

  /**
   * Timestamp message was sent at
   */
  timestamp: Date | ReactNode

  /**
   * Date message was edited at
   */
  edited?: Date

  /**
   * Whether this message mentions the user
   */
  mentioned?: boolean

  /**
   * Whether this message should be highlighted
   */
  highlight?: boolean

  /**
   * Whether this message is being edited
   */
  editing?: boolean

  /**
   * Send status of this message
   */
  sendStatus?: 'sending' | 'failed' | 'sent'

  /**
   * Component to render message context menu
   */
  contextMenu?: () => ReactNode

  /**
   * Additional match cases for the inline-start information element
   */
  infoMatch?: ReactNode

  /**
   * Reference time to render timestamps from
   */
  _referenceTime?: number
}

export function MessageContainer({
  infoMatch,
  _referenceTime,
  avatar,
  children,
  username,
  timestamp,
  info,
  tail,
  edited,
  header,
  isLink,
  compact,
  editing,
  message,
  highlight,
  mentioned,
  sendStatus,
  contextMenu,
}: Props) {
  return (
    <div
      className={`
    group relative flex flex-col py-0.5 bg-transparent rounded-md min-h-[1em]
    transition-colors duration-fast
    [&_a:hover]:underline
    hover:[&_.Toolbar]:flex
    ${tail ? 'mt-0' : 'mt-(--message-group-spacing) !important hover:bg-(--md-sys-color-surface-container)'}
    ${mentioned ? 'bg-(--md-sys-color-primary-container)' : ''}
    ${highlight ? 'animate-highlightMessage' : ''}
    ${sendStatus === 'failed' ? 'text-(--md-sys-color-error)' : ''}
    ${sendStatus === 'sending' ? 'text-(--md-sys-color-outline)' : ''}
    ${sendStatus !== undefined && sendStatus === 'sent' ? 'text-(--md-sys-color-on-surface)' : ''}
    ${isLink === true ? 'cursor-pointer select-none relative **:pointer-events-none' : ''}
    ${isLink === 'hide' ? '' : ''}
  `}>
      {message && isLink !== true && isLink !== 'hide' && <MessageToolbar message={message} />}

      {isLink && <Ripple />}
      {header}

      <div className='flex'>
        <div className={`flex shrink-0 justify-end  ${tail ? 'p-0' : ''} ${!compact ? 'w-13.5' : ''}`}>
          {infoMatch && infoMatch}
          {!infoMatch && compact && (
            <div className='shrink-0 -mt-0.5 h-fit'>
              <div className='flex items-center gap-1'>
                <Tooltip label='Sent '>
                  <p>{timestamp instanceof Date ? timestamp.toLocaleString() : timestamp}</p>
                </Tooltip>
              </div>
              {username}
              {info}
            </div>
          )}
          {!infoMatch && !compact && tail && (
            <div
              className={`flex items-center w-[calc(36px+2*var(--gap-sm))] text-sm text-right mt-1  ${edited ? 'opacity-0 transition-opacity duration-(--transition-fast)' : ''}`}>
              <Tooltip label={`Sent ${timestamp}`}>{edited && 'Sent ' + edited.toString()}</Tooltip>
            </div>
          )}
          {!infoMatch && !compact && !tail && avatar}
        </div>

        <div className={`grow flex flex-col min-w-0 overflow-hidden max-h-[200vh] ${editing ? 'grow' : ''}`}>
          {!tail && !compact && (
            <div className='flex gap-1'>
              <OverflowingText>{username}</OverflowingText>
              <div className='text-nowrap *:text-nowrap'>
                <div className='shrink-0 -mt-0.5 h-fit'>
                  {info}
                  <Tooltip label={`Sent ${timestamp}`}>{edited && 'Sent ' + edited.toString()}</Tooltip>
                  {edited && (
                    <Tooltip label={`Edited ${timestamp}`}>{edited && 'Edited ' + edited.toString()}</Tooltip>
                  )}
                </div>
              </div>
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}
