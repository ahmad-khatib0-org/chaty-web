import { Metadata } from 'next'
import { Trans } from '@/lib/server'

export async function generateMetadata(): Promise<Metadata> {
  const lang = await Trans.getUserLang()
  const title = Trans.tr(lang, 'app.home.title')

  return {
    title,
    description: Trans.tr(lang, 'app.home.description'),
  }
}

type Props = {}

function Page({}: Props) {
  return (
    <main>
      <div className='p-6'>
        <h1 className='text-3xl font-bold'>Home</h1>
      </div>
    </main>
  )
}

export default Page
