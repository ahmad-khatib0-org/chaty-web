import { Trans } from '@/lib/server'

type Props = {}

async function Page({ }: Props) {
  const lang = await Trans.getUserLang()
  console.log('language is ', lang)
  console.log('trans is', Trans.tr(lang, 'users.create.username'))

  return <div>the signup page</div>
}

export default Page
