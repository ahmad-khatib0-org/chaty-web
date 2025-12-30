import 'server-only'

import SignupWrapper from '@/components/auth/signup/signup-wrapper'
import { getPasswordRequirements, Trans } from '@/lib/server'
import {
  USERS_PASSWORD_MAX_LENGTH,
  USERS_PASSWORD_MIN_LENGTH,
  USERS_USERNAME_MAX_LENGHT,
  USERS_USERNAME_MIN_LENGHT,
} from '@/lib/shared'

type Props = {}

function getTranslations(lang: string) {
  const tr = Trans.tr
  return {
    username: tr(lang, 'users.create.username'),
    usernameLenErr: tr(lang, 'users.create.username.error', {
      Min: USERS_USERNAME_MIN_LENGHT,
      Max: USERS_USERNAME_MAX_LENGHT,
    }),
    usernameInvErr: tr(lang, 'users.create.username.invalid'),
    email: tr(lang, 'users.create.email'),
    emailErr: tr(lang, 'users.create.email.error'),
    password: tr(lang, 'users.create.password'),
    passMinErr: tr(lang, 'password.min_length', { Min: USERS_PASSWORD_MIN_LENGTH }),
    passMaxErr: tr(lang, 'password.max_length', { Max: USERS_PASSWORD_MAX_LENGTH }),
    passwordConf: tr(lang, 'users.create.password_confirmation'),
    passwordConfErr: tr(lang, 'users.create.password_confirmation.error'),
    createChaty: tr(lang, 'users.create.chaty_account'),
  }
}

async function Page({ }: Props) {
  const lang = await Trans.getUserLang()
  const tr = getTranslations(lang)

  return <SignupWrapper tr={tr} passwordRequirements={getPasswordRequirements(lang)} />
}

export default Page
