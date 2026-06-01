'use client'
import { useEffect, useState } from 'react'
import { Loader } from '@mantine/core'

import { StateProvider, useAppStore } from '@/state'
import { trackClient } from '@/lib/client'

type Props = {
  children: React.ReactNode
  clientInfo: {
    languageSymbol: string
    languageName: string
    country: string
    currency: string
  }
}

function ClientWrapper({ clientInfo, children }: Props) {
  const setClientInfo = useAppStore((state) => state.setClientInfo)
  const setClientEssentialInfo = useAppStore((state) => state.setClientEssentialInfo)
  const [loading, setLoading] = useState(true)

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

  return <StateProvider>{children}</StateProvider>
}

export default ClientWrapper
