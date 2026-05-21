import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import { Input } from '@mantine/core'
import { CellComponentProps, Grid } from 'react-window'

import { Emoji, Server } from 'chaty-client/models'
import emojiMapping from '../../../data/emoji-mapping.json'
import { useClient } from '@/context/client'
import { CompositionMediaPickerContext } from './composition-media-picker'
import { Avatar } from '@/components/ui'
import { UNICODE_EMOJI_PACK_PUA, UnicodeEmoji } from '@/components/markdown/emoji'
import { useOrderingStore, useSettingsStore } from '@/state'

type Item =
  | /**
   * Server header
   */
  { t: 0; server: Server }
  /**
   * Spacing element
   */
  | { t: 1 }
  /**
   * Custom emoji
   */
  | { t: 2; emoji: Emoji }
  /**
   * Title header
   */
  | { t: 3; title: string }
  /**
   * Unicode emoji
   */
  | { t: 4; name: string; text: string }

const COLUMNS = 10

export function EmojiPicker() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [filter, setFilter] = useState('')
  const { onTextReplacement } = useContext(CompositionMediaPickerContext)!
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  const client = useClient()
  const getValue = useSettingsStore((state) => state.getValue)
  const orderedServers = useOrderingStore((state) => state.orderedServers)

  useEffect(() => {
    if (!containerRef.current) return
    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      setDimensions({ width, height })
    })
    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  const items = useMemo(() => {
    const filterText = filter.toLowerCase()
    if (filterText) {
      const results: Item[] = []
      for (const server of orderedServers(client)) {
        for (const emoji of server.emojis) {
          if (emoji.name.toLowerCase().includes(filterText)) results.push({ t: 2, emoji })
        }
      }

      for (const [name, text] of Object.entries(emojiMapping)) {
        if (name.toLowerCase().includes(filterText)) {
          results.push({ t: 4, name, text: text as string })
        }
      }

      return results
    }

    // Visual example :
    // Row 1: [Server A Header] [spacer] [spacer] ... (fills 10 cells)
    // Row 2: [😀] [😁] [😂] [😊] [spacer] [spacer] ... (emojis + spacers)
    // Row 3: [Server B Header] [spacer] ...
    // Row 4: [🥰] [😍] ...
    //
    const items: Item[] = []
    for (const server of orderedServers(client)) {
      const emojis = server.emojis
      if (emojis.length === 0) continue

      // Add server header (full width)
      items.push({ t: 0, server })

      // Fill empty cells to complete the row
      while (items.length % COLUMNS) items.push({ t: 1 }) // add spacers

      for (const emoji of emojis) items.push({ t: 2, emoji }) // Add emoji (1 cell)

      while (items.length % COLUMNS) items.push({ t: 1 }) // Fill empty cells at end of row
    }

    items.push({ t: 3, title: 'Default' })
    while (items.length % COLUMNS) items.push({ t: 1 })
    for (const [name, text] of Object.entries(emojiMapping)) {
      items.push({ t: 4, name, text: text as string })
    }

    return items
  }, [filter, client, orderedServers])

  const columnWidth = 40
  const columnCount = COLUMNS
  const rowCount = Math.ceil(items.length / columnCount)

  const Cell = ({ style, rowIndex, columnIndex, data }: CellComponentProps<{ data: Item[] }>) => {
    const index = rowIndex * columnCount + columnIndex
    if (index >= data.length) return null
    const item = data[index]

    // t=0: Server header
    if (item.t === 0) {
      return (
        <div style={style} className='flex items-center px-4 w-100'>
          <div className='flex items-center gap-2'>
            <Avatar size={24} src={item.server.iconURL} fallback={item.server.name} />
            <span>{item.server.name}</span>
          </div>
        </div>
      )
    }

    // t=1: Spacer
    if (item.t === 1) {
      return <div style={style} />
    }

    // t=2: Custom emoji
    if (item.t === 2) {
      return (
        <div
          style={style}
          className='relative cursor-pointer p-2 rounded-sm w-full flex items-center justify-center'
          onClick={() => onTextReplacement(`:${item.emoji.id}:`)}>
          <Image
            src={item.emoji.url}
            fill
            sizes='100%'
            className='w-full h-full object-contain'
            alt={item.emoji.name}
          />
        </div>
      )
    }

    // t=3: Title header
    if (item.t === 3) {
      return (
        <div style={style} className='flex items-center px-4 w-100'>
          <span>{item.title}</span>
        </div>
      )
    }

    // t=4: Unicode emoji
    if (item.t === 4) {
      const pack = getValue('appearance:unicode_emoji')
      const puaChar = pack ? UNICODE_EMOJI_PACK_PUA[pack] : ''
      return (
        <div
          style={style}
          className='relative cursor-pointer p-2 rounded-sm w-full flex items-center justify-center'
          onClick={() => onTextReplacement(puaChar + item.text)}>
          <UnicodeEmoji emoji={puaChar + item.text} pack={pack} />
        </div>
      )
    }

    return null
  }

  return (
    <div className='min-h-0 flex flex-col'>
      <Input
        autoFocus
        variant='filled'
        placeholder='Search for emojis...'
        value={filter}
        onMouseDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onInput={(e) => setFilter(e.currentTarget.value)}
      />

      <div className='flex flex-1 min-h-0'>
        <div className='hidden shrink-0 w-10' />
        <div ref={containerRef} className='flex-1 overflow-auto h-full'>
          {dimensions.width > 0 && (
            <Grid
              cellComponent={Cell}
              cellProps={{ data: items }}
              columnCount={columnCount}
              columnWidth={columnWidth}
              rowCount={rowCount}
              rowHeight={40}
              className='h-full w-full'
            />
          )}
        </div>
      </div>
    </div>
  )
}
