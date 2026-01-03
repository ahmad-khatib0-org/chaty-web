import EmailConfirmationWrapper from '@/components/auth/email-confirmation/email-confirmation-wrapper'
import { Trans } from '@/lib/server'

function getTranslations(lang: string) {
  const tr = Trans.tr
  return {
    success: tr(lang, 'users.email_confirmation.success'),
    alreadyConfirmed: tr(lang, 'users.email_confirmation.already_confirmed'),
    tokenExpired: tr(lang, 'users.email_confirmation.token_expired'),
    tokenInvalid: tr(lang, 'users.email_confirmation.token_invalid'),
    titleSuccess: tr(lang, 'users.email_confirmation.title_success'),
    titleError: tr(lang, 'users.email_confirmation.title_error'),
    buttonGoToLogin: tr(lang, 'users.email_confirmation.button_go_to_login'),
    buttonBackToLogin: tr(lang, 'users.email_confirmation.button_back_to_login'),
  }
}

type Props = {}

async function Page({ }: Props) {
  const lang = await Trans.getUserLang()
  const tr = getTranslations(lang)

  return (
    <main>
      <section className='flex min-h-screen justify-center items-center'>
        <EmailConfirmationWrapper tr={tr} />
      </section>
    </main>
  )
}

export default Page
