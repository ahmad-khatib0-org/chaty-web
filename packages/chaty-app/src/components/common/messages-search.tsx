import { useState } from 'react'
import { Input } from '@mantine/core'

type Props = {
  onSubmit: (term: string) => void
  placehoder: string
}

function MessagesSearch({ onSubmit, placehoder }: Props) {
  const [search, setSearch] = useState('')

  const _onSubmit = async () => {
    if (!search.trim().length) return
    onSubmit(search.trim())
  }

  return (
    <Input
      onChange={(e) => setSearch(e.target.value)}
      onKeyDown={() => _onSubmit()}
      placeholder={placehoder}
    />
  )
}

export default MessagesSearch
