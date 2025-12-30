import { object, ref, string } from 'yup'

import {
  USERS_PASSWORD_MAX_LENGTH,
  USERS_PASSWORD_MIN_LENGTH,
  USERS_USERNAME_MAX_LENGHT,
  USERS_USERNAME_MIN_LENGHT,
} from '@/lib/shared'

export class SignupHelpers {
  constructor() { }

  static form(tr: Record<string, string>) {
    return object().shape({
      username: string()
        .min(USERS_USERNAME_MIN_LENGHT, tr.usernameLenErr)
        .max(USERS_USERNAME_MAX_LENGHT, tr.usernameLenErr)
        .typeError(tr.usernameLenErr),
      email: string().email().required(tr.emailErr),
      password: string()
        .min(USERS_PASSWORD_MIN_LENGTH, tr.passMinErr)
        .max(USERS_PASSWORD_MAX_LENGTH, tr.passMaxErr)
        .required(tr.r),
      password_confirmation: string()
        .oneOf([ref('password')], tr.passwordConfErr)
        .required(tr.r),
    })
  }

  static formValues() {
    return { username: '', email: '', password: '', passwordConfirmation: '' }
  }
}
