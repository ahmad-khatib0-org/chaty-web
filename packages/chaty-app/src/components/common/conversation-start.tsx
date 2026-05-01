import { Channel, ChannelType } from 'chaty-client/models'

interface Props {
  startOfConversation: string
  startOfNotes: string
  channel: Channel
}

/**
 * Mark the beginning of a conversation
 */
export function ConversationStart({ startOfNotes, startOfConversation, channel }: Props) {
  return (
    <div className='select-none flex flex-col'>
      {channel.type !== ChannelType.SavedMessages && (
        <h1>
          {channel.text
            ? channel.text.name
            : channel.group
              ? channel.group.name
              : channel.direct
                ? channel.recipient?.username
                : ''}
        </h1>
      )}
      <h2>{channel.type === ChannelType.SavedMessages ? startOfNotes : startOfConversation}</h2>
    </div>
  )
}
