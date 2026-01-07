import 'server-only'
import dynamic from 'next/dynamic'
import { redirect } from 'next/navigation'

const ServerError = dynamic(() => import('@/components/app/server-error'))
import AppSidebar from '@/components/app/app-sidebar'
import { getClientInformation, getForwardableHeaders, getUserAuthInfo } from '@/lib/server'

function getTranslations(lang: string) {
  const tr = require('@/lib/server').Trans.tr
  return {
    home: tr(lang, 'app.sidebar.home'),
    servers: tr(lang, 'app.sidebar.servers'),
    chats: tr(lang, 'app.sidebar.chats'),
    groups: tr(lang, 'app.sidebar.groups'),
    savedMessages: tr(lang, 'app.sidebar.saved_messages'),
    settings: tr(lang, 'app.sidebar.settings'),
    logout: tr(lang, 'app.sidebar.logout'),
    logoutConfirmationTitle: tr(lang, 'app.sidebar.logout_confirmation_title'),
    logoutConfirmationMessage: tr(lang, 'app.sidebar.logout_confirmation_message'),
    cancel: tr(lang, 'app.sidebar.cancel'),
  }
}

export default async function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  const ci = await getClientInformation()
  const { email, success, isInternalError } = await getUserAuthInfo(await getForwardableHeaders())

  if (!success && isInternalError) return <ServerError />
  if (!success) redirect(`/auth/login`)

  const tr = getTranslations(ci.languageSymbol)

  return (
    <div className='grid grid-cols-[auto_1fr] min-h-screen max-h-screen'>
      <AppSidebar email={email} tr={tr} />
      <div className='grid grid-rows-[auto,1fr] max-h-screen overflow-hidden'>
        <div className='overflow-y-auto' style={{ maxHeight: 'calc(100vh - 56px)' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
