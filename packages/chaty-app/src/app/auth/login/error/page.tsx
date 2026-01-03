import { Button } from '@mantine/core'

import { SearchParams } from '@/lib/shared'
import { Trans } from '@/lib/server'

type Props = {
  searchParams: SearchParams
}

async function Page({ searchParams }: Props) {
  const { error, error_description } = await searchParams

  const lang = await Trans.getUserLang()
  const tr = Trans.tr

  return (
    <main className='h-screen flex justify-center items-center'>
      <section className='flex flex-col bg-sugar text-center p-16 border border-dashed border-slate-400'>
        <h1 className='font-bold text-2xl text-blue-900'>{error}</h1>
        <p className='font-bold text-lg mt-8'>{error_description}</p>
        <div className='mt-16'>
          <Button component='a' href='/auth/login' className='rounded-lg bg-blue-950 hover:bg-blue-800'>
            {tr(lang, 'users.login.go_to_login')}
          </Button>
        </div>
      </section>
    </main>
  )
}

export default Page
