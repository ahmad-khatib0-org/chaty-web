'use client'
import { useState, useCallback, useEffect, useMemo } from 'react'
import { MultiSelect } from '@mantine/core'
import { notifications } from '@mantine/notifications'

import { useAppStore } from '@/state'
import { grpcClient, handleGrpcErr } from '@/lib/client'
import { debounce } from '@/lib/shared'
import { ValueLabel } from '@/types/client'

type Props = {
  label: string
  placeholder: string
  nothingFoundMessage: string
  value: string[]
  onChange: (value: string[]) => void
  errorMsg?: string
  disabled?: boolean
}

function UsernamesSearch({
  label,
  placeholder,
  nothingFoundMessage,
  value,
  onChange,
  errorMsg,
  disabled,
}: Props) {
  const info = useAppStore((state) => state.clientInfo)
  const [searchValue, setSearchValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [data, setData] = useState<ValueLabel[]>([])

  const handleSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setData([])
        return
      }

      setIsLoading(true)
      try {
        const res = await grpcClient().searchUsernames({ query: query.trim(), limit: 5 })

        if (res.response.case === 'error') {
          const errorMessage = res.response.value.message
          notifications.show({ message: errorMessage, color: 'red', position: 'top-right' })
          setData([])
        } else if (res.response.case === 'data') {
          const searchResults = res.response.value.users.map((user) => ({
            label: user.username,
            value: user.id,
          }))

          // Include both search results and already selected items to preserve labels
          const selectedMap = new Map(searchResults.map((u) => [u.value, u]))
          const additionalItems: ValueLabel[] = []

          value.forEach((selectedId) => {
            if (!selectedMap.has(selectedId)) {
              additionalItems.push({ label: selectedId, value: selectedId })
            }
          })

          setData([...searchResults, ...additionalItems])
        }
      } catch (err) {
        const message = handleGrpcErr(err, info.languageSymbol)
        notifications.show({ message, color: 'red', position: 'top-right' })
        setData([])
      } finally {
        setIsLoading(false)
      }
    },
    [value, info.languageSymbol]
  )

  const debouncedSearch = useMemo(() => debounce(handleSearch, 500), [handleSearch])

  const handleSearchChange = (query: string) => {
    setSearchValue(query)
    debouncedSearch(query)
  }

  useEffect(() => {
    return () => {
      debouncedSearch.cancel()
    }
  }, [debouncedSearch])

  return (
    <MultiSelect
      label={label}
      placeholder={placeholder}
      nothingFoundMessage={nothingFoundMessage}
      searchable
      clearable
      maxDropdownHeight={200}
      data={data}
      value={value}
      onChange={onChange}
      searchValue={searchValue}
      onSearchChange={handleSearchChange}
      disabled={disabled || isLoading}
      error={errorMsg}
      withAsterisk
    />
  )
}

export default UsernamesSearch
