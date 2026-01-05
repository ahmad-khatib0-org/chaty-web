import { Metadata } from 'next'
import { Trans } from '@/lib/server'

export async function generateMetadata(): Promise<Metadata> {
  const lang = await Trans.getUserLang()
  const title = Trans.tr(lang, 'app.settings.title')

  return {
    title,
    description: Trans.tr(lang, 'app.settings.description'),
  }
}

type Props = {}

function Page({}: Props) {
  return (
    <main>
      <div className='p-6'>
        <h1 className='text-3xl font-bold'>Settings</h1>
      </div>
    </main>
  )
}

export default Page
