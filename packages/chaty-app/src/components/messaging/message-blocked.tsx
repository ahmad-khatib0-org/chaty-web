import { CloseIcon } from '@mantine/core'

interface Props {
  /**
   * Number of blocked messages
   */
  count: number
  // E,g blocked message
  one: string
  // E,g blocked messages
  plural: string
}

export function MessageBlocked({ count, one, plural }: Props) {
  return (
    <div className='relative flex items-center gap-0.5 mt-2 px-2 py-4 text-sm  outline'>
      <CloseIcon />
      <p>{count > 1 ? plural : one}</p>
    </div>
  )
}
