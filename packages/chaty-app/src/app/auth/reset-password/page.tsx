import { Metadata } from 'next'
import dynamic from 'next/dynamic'

const ServerError = dynamic(() => import('@/components/app/server-error'))
import ResetPasswordWrapper from '@/components/auth/reset-password/reset-password-wrapper'
import { Trans, getPasswordRequirements } from '@/lib/server'
import { USERS_PASSWORD_MIN_LENGTH, USERS_PASSWORD_MAX_LENGTH } from '@/lib/shared'

export async function generateMetadata(): Promise<Metadata> {
  const lang = await Trans.getUserLang()
  const title = Trans.tr(lang, 'users.reset_password.title')

  return {
    title,
    description: Trans.tr(lang, 'users.reset_password.description'),
  }
}

function getTranslations(lang: string) {
  const tr = Trans.tr
  return {
    title: tr(lang, 'users.reset_password.title'),
    description: tr(lang, 'users.reset_password.description'),
    password: tr(lang, 'users.reset_password.password'),
    passwordConfirmation: tr(lang, 'users.reset_password.password_confirmation'),
    passwordConfErr: tr(lang, 'users.reset_password.password_conf_error'),
    passMinErr: tr(lang, 'password.min_length', { Min: USERS_PASSWORD_MIN_LENGTH }),
    passMaxErr: tr(lang, 'password.max_length', { Max: USERS_PASSWORD_MAX_LENGTH }),
    submit: tr(lang, 'users.reset_password.submit'),
    backToLogin: tr(lang, 'users.reset_password.back_to_login'),
    successTitle: tr(lang, 'users.reset_password.success_title'),
    successMessage: tr(lang, 'users.reset_password.success_message'),
    tokenInvalid: tr(lang, 'users.reset_password.token_invalid'),
    required: tr(lang, 'forms.fields.required'),
  }
}

type Props = {}

async function Page({}: Props) {
  const lang = await Trans.getUserLang()
  const tr = getTranslations(lang)

  try {
    return (
      <main>
        <section className='min-h-screen flex justify-center items-center'>
          <ResetPasswordWrapper tr={tr} passwordRequirements={getPasswordRequirements(lang)} />
        </section>
      </main>
    )
  } catch (err) {
    return <ServerError />
  }
}

export default Page
