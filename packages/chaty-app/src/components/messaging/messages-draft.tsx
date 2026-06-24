import { useMemo } from 'react'

import { Channel } from 'chaty-client/models'
import { useDraftsStore } from '@/state'
import { DraftMessage } from './message-draft'
import { ObjString } from '@/types/shared'

interface Props {
  tr: ObjString
  channel: Channel
  tail: boolean
  sentIds: string[]
}

/**
 * Draft Messages component
 */
export function MessagesDraft({ channel, sentIds, tail, tr }: Props) {
  const { getPendingMessages } = useDraftsStore()

  const pendingMessages = getPendingMessages(channel.id)

  const unsent = useMemo(
    () =>
      pendingMessages
        .filter((draft) => draft.status === 'sending')
        .filter((draft) => !sentIds.includes(draft.idempotencyKey)),
    [pendingMessages, sentIds]
  )

  const failed = useMemo(
    () => pendingMessages.filter((draft) => draft.status !== 'sending'),
    [pendingMessages]
  )

  const trans = {
    sending: tr.sending,
    cancelMessage: tr.cancelMessage,
    deleteMessage: tr.deleteMessage,
    failedToSend: tr.failedToSend,
    retrySending: tr.retrySending,
    unsentMsg: tr.unsentMsg,
  }

  return (
    <>
      {unsent.map((draft, index) => (
        <DraftMessage
          tr={trans}
          key={draft.idempotencyKey}
          draft={draft}
          channel={channel}
          tail={index !== 0 || tail}
        />
      ))}
      {failed.map((draft) => (
        <DraftMessage key={draft.idempotencyKey} draft={draft} channel={channel} tr={trans} />
      ))}
    </>
  )
}
