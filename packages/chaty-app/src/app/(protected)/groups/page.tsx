import { Metadata } from 'next'

import GroupsWrapper from '@/components/groups/groups-wrapper'
import { Trans } from '@/lib/server'

export async function generateMetadata(): Promise<Metadata> {
  const lang = await Trans.getUserLang()
  const title = Trans.tr(lang, 'app.groups.title')

  return {
    title,
    description: Trans.tr(lang, 'app.groups.description'),
  }
}

function getTranslations(lang: string) {
  const tr = Trans.tr
  return {
    myGroups: tr(lang, 'app.groups.my_groups'),
    searchMessages: tr(lang, 'app.groups.search'),
    create: tr(lang, 'app.groups.create'),
  }
}

type Props = {}

async function Page({ }: Props) {
  const lang = await Trans.getUserLang()
  const tr = getTranslations(lang)

  return (
    <main>
      <section>
        <GroupsWrapper tr={tr} />
      </section>
    </main>
  )
}

export default Page
