import { object, ref, string } from 'yup'

import { AppError } from '@chaty-app/proto/web/shared/v1/error_pb'
import {
  USERS_PASSWORD_MAX_LENGTH,
  USERS_PASSWORD_MIN_LENGTH,
  USERS_USERNAME_MAX_LENGHT,
  USERS_USERNAME_MIN_LENGHT,
} from '@/lib/shared'
import { UseFormReturnType } from '@mantine/form'
import { getCookie, setCookie } from 'cookies-next/client'

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
      passwordConfirmation: string()
        .oneOf([ref('password')], tr.passwordConfErr)
        .required(tr.r),
    })
  }

  static formValues() {
    return { username: '', email: '', password: '', passwordConfirmation: '' }
  }

  static handleSubmitErrors(err: AppError, form: UseFormReturnType<ReturnType<typeof this.formValues>>) {
    const e = err.errors
    if (e.hasOwnProperty('username')) form.setFieldError('username', e['username'])
    if (e.hasOwnProperty('email')) form.setFieldError('email', e['email'])
    if (e.hasOwnProperty('password')) form.setFieldError('password', e['password'])
  }
}

export class LoginHelpers {
  constructor() { }

  private static clientID = process.env.NEXT_PUBLIC_OAUTH_CLIENT_ID!
  private static redirectURL = process.env.NEXT_PUBLIC_OAUTH_REDIRECT_URL!
  private static oauthURL = process.env.NEXT_PUBLIC_OAUTH_AUTH_URL!

  static prepareLoginUrl(): URL {
    const state = crypto.randomUUID()

    setCookie('oauth_state', state, {
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 600,
    })

    const url = new URL(this.oauthURL)
    url.searchParams.set('client_id', this.clientID)
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('scope', 'openid offline')
    url.searchParams.set('redirect_uri', this.redirectURL)
    url.searchParams.set('state', state)

    return url
  }

  /**
   * Check if we're in a Hydra login flow (has login_challenge)
   * OR if we need to start a new OAuth flow
   */
  static checkLoginUrl(currentUrl: string): URL | undefined {
    try {
      const url = new URL(currentUrl)

      // If we have a login_challenge, we're in Hydra flow - don't redirect
      if (url.searchParams.get('login_challenge')) return undefined

      // Otherwise, check if we have all OAuth parameters for a new flow
      const requiredParams = ['client_id', 'response_type', 'scope', 'redirect_uri', 'state']

      for (const param of requiredParams) {
        const value = url.searchParams.get(param)
        if (!value || value.trim() === '') {
          return this.prepareLoginUrl()
        }
      }

      const state = url.searchParams.get('state')
      const stateCookie = getCookie('oauth_state') as string

      if (!stateCookie || stateCookie !== state) {
        return this.prepareLoginUrl()
      }

      return undefined
    } catch (error) {
      return this.prepareLoginUrl()
    }
  }

  static getLoginChallengeParam(location: string): string {
    try {
      const url = new URL(location)
      return url.searchParams.get('login_challenge') ?? ''
    } catch {
      return ''
    }
  }
}

export class ForgotPasswordHelpers {
  constructor() { }

  static form(tr: Record<string, string>) {
    return object().shape({
      email: string().email(tr.emailInvalid).required(tr.emailInvalid),
    })
  }

  static formValues() {
    return { email: '' }
  }

  static handleSubmitErrors(err: AppError, form: UseFormReturnType<ReturnType<typeof this.formValues>>) {
    const e = err.errors
    if (e.hasOwnProperty('email')) form.setFieldError('email', e['email'])
  }
}

export class ResetPasswordHelpers {
  constructor() { }

  static form(tr: Record<string, string>) {
    return object().shape({
      password: string()
        .min(USERS_PASSWORD_MIN_LENGTH, tr.passMinErr)
        .max(USERS_PASSWORD_MAX_LENGTH, tr.passMaxErr)
        .required(tr.required),
      passwordConfirmation: string()
        .oneOf([ref('password')], tr.passwordConfErr)
        .required(tr.required),
    })
  }

  static formValues() {
    return { password: '', passwordConfirmation: '' }
  }

  static handleSubmitErrors(err: AppError, form: UseFormReturnType<ReturnType<typeof this.formValues>>) {
    const e = err.errors
    if (e.hasOwnProperty('password')) form.setFieldError('password', e['password'])
  }
}
