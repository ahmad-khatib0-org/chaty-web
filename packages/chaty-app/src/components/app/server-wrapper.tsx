import 'server-only'
import { ColorSchemeScript, mantineHtmlProps, MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'

import ClientWrapper from '@/components/app/client-wrapper'
import { getClientInformation } from '@/lib/server'

type Props = {
  children: React.ReactNode
}

async function ServerWrapper({ children }: Props) {
  const { languageSymbol, languageName, currency, location } = await getClientInformation()

  return (
    <html lang={languageSymbol} {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
      </head>
      <body suppressHydrationWarning={true}>
        <MantineProvider>
          {children}
          <Notifications />
          <ClientWrapper clientInfo={{ languageSymbol, languageName, currency, country: location }} />
        </MantineProvider>
      </body>
    </html>
  )
}

export default ServerWrapper
