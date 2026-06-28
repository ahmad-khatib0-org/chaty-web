import { useEffect, useRef } from 'react'

import { AutoCompleteSearchSpace } from '../common'
import { IconBlocks } from '@tabler/icons-react'
import { ObjString } from '@/types/shared'
import { TextEditor } from '../ui/text-editor'

interface Props {
  tr: ObjString
  /**
   * Initial content
   */
  initialValue: readonly [string]

  /**
   * Node replacement
   */
  nodeReplacement?: readonly [string | '_focus']

  /**
   * Text content
   */
  content: string

  /**
   * Handle event to send message
   */
  onSendMessage: () => void

  /**
   * Handle event when user is typing
   */
  onTyping: () => void

  /**
   * Handle event when user wants to edit the last message in chat
   */
  onEditLastMessage: () => void

  /**
   * Update text content
   * @param v New content
   */
  setContent: (v: string) => void

  /**
   * Actions to the left of the message box
   */
  actionsStart: React.ReactNode

  /**
   * Actions to the right of the message box
   */
  actionsEnd: React.ReactNode

  /**
   * Elements appended after the message box row
   */
  actionsAppend: React.ReactNode

  /**
   * Whether there are elements appended after the message box row
   */
  hasActionsAppend: boolean

  /**
   * Placeholder in message box
   */
  placeholder: string

  /**
   * Whether sending messages is allowed
   */
  sendingAllowed: boolean

  /**
   * Auto complete config
   */
  autoCompleteSearchSpace?: () => AutoCompleteSearchSpace

  /**
   * Update the current draft selection
   *
   * @deprecated have to hook into ProseMirror instance now!
   */
  updateDraftSelection?: (start: number, end: number) => void
}

/**
 * Specific-width icon container
 */
export const InlineIcon = ({
  children,
  size = 'normal',
}: {
  children: React.ReactNode
  size?: 'short' | 'normal' | 'wide'
}) => {
  const sizeClasses = {
    short: 'w-[14px]',
    normal: 'w-[42px]',
    wide: 'w-[62px]',
  }

  return <div className={`shrink-0 flex items-end justify-center ${sizeClasses[size]}`}>{children}</div>
}

export function MessageBox({
  tr,
  content,
  onTyping,
  actionsEnd,
  setContent,
  placeholder,
  actionsStart,
  initialValue,
  actionsAppend,
  onSendMessage,
  sendingAllowed,
  hasActionsAppend,
  onEditLastMessage,
  nodeReplacement,
  autoCompleteSearchSpace,
  updateDraftSelection,
}: Props) {
  const baseRef = useRef<HTMLDivElement>(null)

  // props.updateDraftSelection?.(
  //   event.currentTarget.selectionStart,
  //   event.currentTarget.selectionEnd,
  // );

  /**
   * Set initial draft selection
   */
  useEffect(() => {
    updateDraftSelection?.(content.length, content.length)
  }, [])

  return (
    <div className='grow shrink-0 flex gap-4 mb-4'>
      <div
        ref={baseRef}
        className={`grow pr-4 py-2 rounded-t-(--borderRadius-xl) flex bg-(--md-sys-color-surface-container-high) text-(--md-sys-color-on-surface) ${hasActionsAppend ? 'rounded-b-(--borderRadius-md)' : 'rounded-b-(--borderRadius-xl)'}`}>
        {!sendingAllowed && (
          <InlineIcon size='wide'>
            <div className='grow text-sm select-none p-4'>
              <IconBlocks size={24} />
            </div>
          </InlineIcon>
        )}
        {sendingAllowed && actionsStart}

        {!sendingAllowed && (
          <div className='grow text-sm select-none p-4 flex items-center'>
            <p>{tr.noPremToSend}</p>
          </div>
        )}

        {sendingAllowed && (
          <>
            <TextEditor
              placeholder={placeholder}
              initialValue={initialValue}
              nodeReplacement={nodeReplacement}
              onChange={setContent}
              onComplete={onSendMessage}
              onTyping={onTyping}
              onPreviousContext={onEditLastMessage}
              autoCompleteSearchSpace={autoCompleteSearchSpace}
            />
            {sendingAllowed && actionsEnd}
          </>
        )}
      </div>
      {sendingAllowed && actionsAppend}
    </div>
  )
}

MessageBox.InlineIcon = InlineIcon
