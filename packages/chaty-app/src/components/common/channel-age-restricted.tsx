import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader } from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import { IconAlertTriangle } from '@tabler/icons-react'
import { LAYOUT_SECTIONS, useLayoutStore } from '@/state'

type Props = {
  enabled: boolean
  contentId: string
  contentName: string
  children: React.ReactNode
  tr: {
    confirmAge: string
    enterChannel: string
    back: string
    matureChannel: string
    chanNotAvailable: string
    chanNotAvailableRegion: string
    [key: string]: string
  }
}

type GeoBlock = {
  countryCode: string
  isAgeRestrictedGeo: boolean
}

export function ChannelAgeRestricted({ enabled, children, contentId, contentName, tr }: Props) {
  const navigate = useRouter()
  const [confirmed, setConfirmed] = useState(false)
  const [allowed, setAllowed] = useState(false)

  const getSectionState = useLayoutStore((state) => state.getSectionState)

  const handleEnterChannel = () => {
    if (confirmed) setAllowed(true)
  }

  const geoQuery = useQuery({
    queryKey: ['geoblock'],
    queryFn: async (): Promise<GeoBlock> => {
      const response = await fetch('https://geo.revolt.chat')
      if (!response.ok) {
        throw new Error('Failed to fetch geo data')
      }
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  useEffect(() => {
    const init = () => {
      setAllowed(getSectionState(contentId + '-nsfw', false))
      setConfirmed(getSectionState(LAYOUT_SECTIONS.MATURE, false))
    }
    init()
  }, [])

  // If age gate not enabled, just render children
  if (!enabled) return <>{children}</>

  if (geoQuery.isLoading) return <Loader />

  if (!confirmed || !allowed) {
    return (
      <div className='h-full flex flex-col items-center justify-center p-8 select-none overflow-y-auto text-gray-900 dark:text-gray-100 gap-4'>
        <IconAlertTriangle size={64} className='text-orange-500 fill-orange-500' />

        <p className='text-2xl font-semibold'>{contentName}</p>

        <p className='text-lg'>{tr.matureChannel}</p>

        <label className='flex gap-3 items-center cursor-pointer'>
          <input
            type='checkbox'
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className='w-5 h-5 rounded border-gray-300 dark:border-gray-600 
                     text-orange-500 focus:ring-orange-500'
          />
          <span className='text-lg'>{tr.confirmAge}</span>
        </label>

        <div className='flex gap-6 mt-4'>
          <button
            onClick={() => navigate.back()}
            className='px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors'>
            {tr.back}
          </button>
          <button
            onClick={handleEnterChannel}
            disabled={!confirmed}
            className={`px-6 py-2 rounded-md font-medium transition-all
              ${confirmed
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}>
            {tr.enterChannel}
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
