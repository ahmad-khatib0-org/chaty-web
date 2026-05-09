import { useUser } from '@/context/client'
import { Message } from 'chaty-client/models'

interface Props {
  message?: Message
}

export function MessageToolbar({ message }: Props) {
  const user = useUser()

  return <></>
}
