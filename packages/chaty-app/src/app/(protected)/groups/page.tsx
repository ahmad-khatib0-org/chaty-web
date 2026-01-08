import { Metadata } from 'next'

import GroupsWrapper from '@/components/groups/groups-wrapper'
import { Trans } from '@/lib/server'
import { GROUPS_DESCRIPTION_MAX_LENGTH, GROUPS_NAME_MAX_LENGTH, GROUPS_NAME_MIN_LENGTH } from '@/lib/shared'

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
    createGroup: tr(lang, 'app.groups.create_group'),
    groupName: tr(lang, 'app.groups.group_name'),
    groupNamePlaceholder: tr(lang, 'app.groups.group_name_placeholder'),
    groupNameRequired: tr(lang, 'app.groups.group_name_required'),
    groupNameLength: tr(lang, 'app.groups.group_name_length', {
      Min: GROUPS_NAME_MIN_LENGTH,
      Max: GROUPS_NAME_MAX_LENGTH,
    }),
    groupDescription: tr(lang, 'app.groups.group_description'),
    groupDescriptionPlaceholder: tr(lang, 'app.groups.group_description_placeholder'),
    groupDescriptionLength: tr(lang, 'app.groups.group_description_length', {
      Max: GROUPS_DESCRIPTION_MAX_LENGTH,
    }),
    recipients: tr(lang, 'app.groups.recipients'),
    recipientsPlaceholder: tr(lang, 'app.groups.recipients_placeholder'),
    recipientsRequired: tr(lang, 'app.groups.recipients_required'),
    nsfw: tr(lang, 'app.groups.nsfw'),
    errorCreatingGroup: tr(lang, 'app.groups.error_creating_group'),
    cancel: tr(lang, 'app.groups.cancel'),
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
