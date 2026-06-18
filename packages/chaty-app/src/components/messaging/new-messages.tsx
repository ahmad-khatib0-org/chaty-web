import { decodeTime } from 'ulid'
import { IconX } from '@tabler/icons-react'

import { FloatingIndicator } from '../app'
import { fromNow, tr as trans } from '@/lib/client'
import { useAppStore } from '@/state'

interface Props {
  /**
   * The last Id of the message the user read
   */
  lastId: string | undefined

  /**
   * Jump back to the last message
   */
  jumpBack: () => void

  /**
   * Dismiss the message
   */
  dismiss: () => void

  tr: {
    jumpToBeginning: string
  }
}

/**
 * Component indicating to user there were new messages in chat
 */
export function NewMessages({ lastId, jumpBack, dismiss, tr }: Props) {
  const { languageSymbol } = useAppStore((state) => state.clientInfo)
  function onCancel(e: React.MouseEvent) {
    e.stopPropagation()
    dismiss()
  }

  if (!lastId) return null

  return (
    <FloatingIndicator position='top' onClick={jumpBack}>
      <div className='relative overflow-hidden rounded-full'>
        <div className='absolute inset-0 rounded-full' />
      </div>
      <span className='grow'>
        {trans(languageSymbol, 'chat.new_messages_since', { Time: fromNow(new Date(decodeTime(lastId))) })}
      </span>
      <span>{tr.jumpToBeginning}</span>
      <div className='h-4 cursor-pointer' onClick={onCancel}>
        <IconX size={16} />
      </div>
    </FloatingIndicator>
  )
}
