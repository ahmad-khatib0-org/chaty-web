import { Message } from 'chaty-client/models'

interface Props {
  replyId: string
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

export function MessageReply({ message, mention, noDecorations }: Props) {
  return <></>
}
