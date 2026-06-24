import Image from 'next/image'
import { Text } from '@mantine/core'

import { userInformation } from '@/context'
import { useClient, useUser } from '@/context/client'
import { UnsentMessage, useDraftsStore, useSettingsStore } from '@/state'
import { Channel } from 'chaty-client/models'
import { MessageContainer } from '../common/message-container'
import { Avatar, ColouredText, SizedContent } from '../ui'
import { MessageReply } from '../common/message-reply'
import { MessageDraftContextMenu } from '../menus'
import { Markdown } from '../markdown'

interface Props {
  draft: UnsentMessage
  channel: Channel
  tail?: boolean
  tr: {
    sending: string
    failedToSend: string
    unsentMsg: string
    cancelMessage: string
    retrySending: string
    deleteMessage: string
  }
}

/**
 * Unsent message preview
 */
export function DraftMessage({ draft, channel, tail, tr }: Props) {
  const user = useUser()
  const client = useClient()
  const { getFile } = useDraftsStore()
  const { getValue } = useSettingsStore()
  const userInfo = () => userInformation(user, channel.server?.member)

  const getTimestampText = () => {
    if (draft.status === 'sending') return <span>{tr.sending}</span>
    if (draft.status === 'failed') return <span>{tr.failedToSend}</span>
    return <span>{tr.unsentMsg}</span>
  }

  return (
    <MessageContainer
      tail={tail && (!draft.replies || draft.replies.length === 0)}
      avatar={<Avatar src={userInfo().avatar} size={36} />}
      timestamp={getTimestampText()}
      sendStatus={draft.status === 'sending' ? 'sending' : 'failed'}
      username={<ColouredText>{userInfo().username}</ColouredText>}
      header={draft.replies?.map((reply) => (
        <MessageReply
          key={reply.id}
          replyId={reply.id}
          message={client.messages.get(reply.id)}
          mention={reply.mention}
        />
      ))}
      compact={getValue('appearance:compact_mode')}
      contextMenu={() => (
        <MessageDraftContextMenu
          draft={draft}
          channel={channel}
          tr={{
            cancelMessage: tr.cancelMessage,
            deleteMessage: tr.deleteMessage,
            retrySending: tr.retrySending,
          }}
        />
      )}>
      <div className='wrap-break-word [&_.math]:overflow-x-auto [&_.math]:overflow-y-hidden [&_.math]:max-h-screen'>
        <Markdown content={draft.content} />
      </div>

      {draft.files?.map((id) => {
        const file = getFile(id)
        if (!file) return null
        return (
          <div key={id}>
            <Text className='label'>
              Uploading file {file.file.name}... {(file.uploadProgress[0]() * 100).toFixed()}%
            </Text>
            {file.dimensions && file.dataUri && (
              <SizedContent width={file.dimensions[0]} height={file.dimensions[1]}>
                <Image src={file.dataUri} sizes='100%' alt={file.file.name} className='object-fill' fill />
              </SizedContent>
            )}
          </div>
        )
      })}
    </MessageContainer>
  )
}
