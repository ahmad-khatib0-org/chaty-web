import dynamic from 'next/dynamic'

const ServerError = dynamic(() => import('@/components/app/server-error'))
import LoginWrapper from '@/components/auth/login/login-wrapper'
import { oauthServiceStatusChecker, Trans } from '@/lib/server'
import { USERS_PASSWORD_MAX_LENGTH, USERS_PASSWORD_MIN_LENGTH } from '@/lib/shared'

function getTranslations(lang: string) {
  const tr = Trans.tr
  return {
    r: tr(lang, 'forms.fields.required'),
    email: tr(lang, 'users.login.email'),
    password: tr(lang, 'users.login.password'),
    emailErr: tr(lang, 'users.create.email.error'),
    passMinErr: tr(lang, 'password.min_length', { Min: USERS_PASSWORD_MIN_LENGTH }),
    passMaxErr: tr(lang, 'password.max_length', { Max: USERS_PASSWORD_MAX_LENGTH }),
    login: tr(lang, 'login.login_btn'),
    wel: tr(lang, 'login.welcome_back'),
    chatyDesc: tr(lang, 'chaty.logo.description'),
  }
}

type Props = {}

async function Page({ }: Props) {
  const lang = await Trans.getUserLang()
  const tr = getTranslations(lang)

  try {
    const isAlive = await oauthServiceStatusChecker.isOauthServiceAlive()
    if (!isAlive) return <ServerError />
    return (
      <main>
        <section className='min-h-screen justify-center items-center'>
          <LoginWrapper tr={tr} />
        </section>
      </main>
    )
  } catch (err) {
    return <ServerError />
  }
}

export default Page
