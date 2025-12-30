'use client'
import { useEffect, useState } from 'react'
import { Loader } from '@mantine/core'

import { useAppStore } from '@/state'
import { trackClient } from '@/lib/client'

type Props = {
  clientInfo: {
    languageSymbol: string
    languageName: string
    country: string
    currency: string
  }
}

function ClientWrapper({ clientInfo }: Props) {
  const setClientInfo = useAppStore((state) => state.setClientInfo)
  const setClientEssentialInfo = useAppStore((state) => state.setClientEssentialInfo)
  const [loading, setLoading] = useState(false)

  const init = async () => {
    if (loading) return
    setLoading(true)
    setClientEssentialInfo(clientInfo)

    try {
      const enhancedClientInfo = await trackClient({}, { enableFingerprinting: true })
      setClientInfo({ ...enhancedClientInfo })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    init()
  }, [])

  if (loading) return <Loader />
  return null
}

export default ClientWrapper
