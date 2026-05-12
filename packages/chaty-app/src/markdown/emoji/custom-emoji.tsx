import { useClient } from '@/context/client'
import { EmojiBase } from '.'

interface CustomEmojiProps extends React.ComponentPropsWithoutRef<typeof EmojiBase> {
  id: string
}

/**
 * Display custom emoji
 */
export function CustomEmoji({ id, ...restProps }: CustomEmojiProps) {
  const client = useClient()

  const url = `${client?.configuration?.features?.files?.url}/emojis/${id}`

  return <EmojiBase {...restProps} src={url} alt={`:${id}:`} />
}
