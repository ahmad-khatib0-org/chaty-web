import { IconRefresh, IconTrash } from '@tabler/icons-react'

import { Channel } from 'chaty-client/models'
import { UnsentMessage, useDraftsStore } from '@/state'
import { useClient } from '@/context/client'
import { ContextMenu, ContextMenuButton } from './context-menu'

interface Props {
  draft: UnsentMessage
  channel: Channel
  tr: {
    retrySending: string
    deleteMessage: string
    cancelMessage: string
  }
}

/**
 * Context menu for draft messages
 */
export function MessageDraftContextMenu({ draft, channel, tr }: Props) {
  const { retrySend, cancelSend } = useDraftsStore()
  const client = useClient()

  /**
   * Retry sending the draft message
   */
  function handleRetrySend() {
    retrySend(client, channel, draft.idempotencyKey)
  }

  /**
   * Delete the draft message
   */
  function handleDeleteMessage() {
    cancelSend(channel, draft.idempotencyKey)
  }

  if (draft.status === 'sending') return null

  return (
    <ContextMenu>
      {(draft.status === 'failed' || draft.status === 'unsent') && (
        <>
          <ContextMenuButton icon={IconRefresh} onClick={handleRetrySend}>
            {tr.retrySending}
          </ContextMenuButton>
          <ContextMenuButton icon={IconTrash} onClick={handleDeleteMessage} destructive>
            {tr.deleteMessage}
          </ContextMenuButton>
        </>
      )}
    </ContextMenu>
  )
}
