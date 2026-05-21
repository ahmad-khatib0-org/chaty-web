import { createContext, Suspense, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Loader, TextInput } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'

import { useClient } from '@/context/client'
import { CellComponentProps, Grid } from 'react-window'
import { CompositionMediaPickerContext } from './composition-media-picker'

type GifCategory = { title: string; image: string }

type GifResult = {
  url: string
  media_formats: Record<'webm' | 'tinywebm', { url: string }>
}

const FilterContext = createContext<((value: string) => void) | null>(null)

export function GifPicker() {
  const [filter, setFilter] = useState('')
  const filterLowercase = filter.toLowerCase()

  return (
    <div className='min-h-0 flex flex-col'>
      <TextInput
        autoFocus
        variant='filled'
        placeholder='search for gifs...'
        value={filter}
        onMouseDown={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onChange={(e) => setFilter(e.currentTarget.value)}
      />
      <Suspense fallback={<Loader />}>
        {filterLowercase && <GifSearch query={filterLowercase} />}
        {!filterLowercase && (
          <FilterContext.Provider value={setFilter}>
            <Categories />
          </FilterContext.Provider>
        )}
      </Suspense>
    </div>
  )
}

type CategoryItem = { t: 0; category: GifCategory } | { t: 1; gif: GifResult | null }

function Categories() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  const setFilter = useContext(FilterContext)
  const client = useClient()

  const trendingCategories = useQuery<GifCategory[]>({
    queryKey: ['trendingGifCategories'],
    queryFn: async () => {
      const [authHeader, authHeaderValue] = client.authenticationHeader
      const res = await fetch('https://api.gifbox.me/categories?locale=en_US', {
        headers: { [authHeader]: authHeaderValue },
      })
      return res.json()
    },
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  })

  const trendingGif = useQuery<GifResult | null>({
    queryKey: ['trendingGif1'],
    queryFn: async () => {
      const [authHeader, authHeaderValue] = client.authenticationHeader
      const res = await fetch('https://api.gifbox.me/trending?locale=en_US&limit=1', {
        headers: { [authHeader]: authHeaderValue },
      })
      const data = await res.json()
      return data.results[0]
    },
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    initialData: null,
  })

  const items = useMemo(() => {
    return [
      { t: 1, gif: trendingGif.data },
      ...(trendingCategories.data?.map((category) => ({ t: 0, category })) ?? []),
    ] as CategoryItem[]
  }, [trendingGif.data, trendingCategories.data])

  useEffect(() => {
    if (!containerRef.current) return
    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      setDimensions({ width, height })
    })

    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  const columnWidth = 200
  const columnCount = Math.max(1, Math.floor(dimensions.width / columnWidth))
  const rowCount = Math.ceil(items.length / columnCount)

  if (trendingCategories.isLoading) return <Loader />

  // This is the Cell Component - passed via cellComponent prop
  const CellComponent = ({
    columnIndex,
    rowIndex,
    style,
    data,
  }: CellComponentProps<{ data: CategoryItem[] }>) => {
    const index = rowIndex * columnCount + columnIndex
    if (index >= data.length) return null
    const item = data[index]
    const imageUrl = item.t === 0 ? item.category.image : item.gif?.url

    return (
      <div
        className='w-full h-30 bg-cover bg-center text-white flex p-4 items-end justify-end cursor-pointer'
        style={{
          ...style,
          backgroundImage: `linear-gradient(to right, #0006, #0006), url("${imageUrl}")`,
        }}
        onClick={() => setFilter?.(item.t === 0 ? item.category.title : 'trending')}>
        {item.t === 0 ? item.category.title : <p>Trending GIFs</p>}
      </div>
    )
  }

  return (
    <div ref={containerRef} className='overflow-auto h-full'>
      {dimensions.width > 0 && (
        <Grid
          cellComponent={CellComponent}
          cellProps={{ data: items }}
          columnCount={columnCount}
          columnWidth={columnWidth}
          rowCount={rowCount}
          rowHeight={120}
        />
      )}
    </div>
  )
}

function GifSearch({ query }: { query: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const client = useClient()
  const { onMessage } = useContext(CompositionMediaPickerContext)!

  const search = useQuery<GifResult[]>({
    queryKey: ['gifs', query],
    queryFn: async () => {
      const [authHeader, authHeaderValue] = client.authenticationHeader
      const endpoint =
        query === 'trending'
          ? 'trending?locale=en_US'
          : `search?locale=en_US&query=${encodeURIComponent(query)}`
      const res = await fetch(`https://api.gifbox.me/${endpoint}`, {
        headers: { [authHeader]: authHeaderValue },
      })
      const data = await res.json()
      return data.results
    },
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      setDimensions({ width, height })
    })

    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  const columnWidth = 200
  const columnCount = Math.max(1, Math.floor(dimensions.width / columnWidth))
  const rowCount = Math.ceil((search.data?.length ?? 0) / columnCount)

  const CellComponent = ({ columnIndex, rowIndex, style, data }: any) => {
    const index = rowIndex * columnCount + columnIndex
    const item = data?.[index]
    if (!item) return null

    return (
      <video
        style={style}
        loop
        autoPlay
        muted
        preload='auto'
        className='w-full h-30 cursor-pointer object-cover'
        src={item.media_formats.tinywebm.url}
        onClick={() => onMessage(item.url)}
      />
    )
  }

  if (search.isLoading) return <Loader />

  return (
    <div ref={containerRef} className='overflow-auto h-full'>
      {dimensions.width > 0 && search.data && (
        <Grid
          cellComponent={CellComponent}
          cellProps={{ data: search.data }}
          columnCount={columnCount}
          columnWidth={columnWidth}
          rowCount={rowCount}
          rowHeight={120}
        />
      )}
    </div>
  )
}
