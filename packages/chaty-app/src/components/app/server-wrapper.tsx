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
          <ClientWrapper clientInfo={{ languageSymbol, languageName, currency, country: location }}>
            {children}
          </ClientWrapper>
          <Notifications />
        </MantineProvider>
      </body>
    </html>
  )
}

export default ServerWrapper
