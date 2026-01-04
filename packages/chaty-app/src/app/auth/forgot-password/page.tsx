import ForgotPasswordWrapper from '@/components/auth/forgot-password/forgot-password-wrapper'
import { Trans } from '@/lib/server'

function getTranslations(lang: string) {
  const tr = Trans.tr
  return {
    title: tr(lang, 'users.forgot_password.title'),
    description: tr(lang, 'users.forgot_password.description'),
    email: tr(lang, 'users.forgot_password.email'),
    emailInvalid: tr(lang, 'users.forgot_password.email_invalid'),
    submit: tr(lang, 'users.forgot_password.submit'),
    backToLogin: tr(lang, 'users.forgot_password.back_to_login'),
    successTitle: tr(lang, 'users.forgot_password.success_title'),
    successMessage: tr(lang, 'users.forgot_password.success_message'),
    errorTitle: tr(lang, 'users.forgot_password.error_title'),
    errorEmailNotFound: tr(lang, 'users.forgot_password.error_email_not_found'),
  }
}

type Props = {}

async function Page({ }: Props) {
  const lang = await Trans.getUserLang()
  const tr = getTranslations(lang)

  return (
    <main>
      <section className='min-h-screen flex justify-center items-center'>
        <ForgotPasswordWrapper tr={tr} />
      </section>
    </main>
  )
}

export default Page
