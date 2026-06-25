'use client'
import { useEffect, useState } from 'react'
import { Loader } from '@mantine/core'

import { StateProvider, useAppStore } from '@/state'
import { trackClient } from '@/lib/client'
import { useClient } from '@/context/client'

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
  const { setClientEssentialInfo, setClientInfo, setClientConnState } = useAppStore()
  const [loading, setLoading] = useState(true)
  const client = useClient()

  const initConnectionStateObservable = () => {
    client.events.on.state.subscribe((state) => setClientConnState(state))
  }

  const initInfo = async () => {
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
    initInfo()
    initConnectionStateObservable()
  }, [])

  if (loading) return <Loader />

  return <StateProvider>{children}</StateProvider>
}

export default ClientWrapper
