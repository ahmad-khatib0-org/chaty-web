import { IconArrowForward } from '@tabler/icons-react'
import { FloatingIndicator } from '../app'

interface Props {
  viewOlderMessages: string
  jumpToPresent: string
  /**
   * Jump back to present messages
   */
  onClick: () => void
}

/**
 * Component indicating user can jump back to present messages
 */
export function JumpToBottom({ onClick, viewOlderMessages, jumpToPresent }: Props) {
  return (
    <FloatingIndicator position='top' onClick={onClick}>
      <span className='grow'>{viewOlderMessages}</span>
      <span>{jumpToPresent}</span>
      <IconArrowForward size={16} />
    </FloatingIndicator>
  )
}
