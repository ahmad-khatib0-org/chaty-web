import { NextRequest, NextResponse } from 'next/server'

import { Trans } from '@/lib/server'
import { ConsentAcceptResult, ConsentRequest } from '@/types/server'

export async function GET(request: NextRequest) {
  const lang = await Trans.getUserLang()
  const challenge = request.nextUrl.searchParams.get('consent_challenge')

  const returnErr = (lang: string, msgId: string) => {
    const msg = Trans.tr(lang, 'users.login.error')
    const desc = Trans.tr(lang, msgId)
    const url = `${process.env.OAUTH_FRONTEND_LOGIN_ERROR_URL}?error=${encodeURIComponent(msg)}&error_description=${encodeURIComponent(desc)}&translated=true`
    return NextResponse.redirect(url)
  }

  if (!challenge) {
    return returnErr(lang, 'oauth.login_challenge.missing')
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10000)

  try {
    const consentUrl = `${process.env.OAUTH_ADMIN_URL}/oauth2/auth/requests/consent?consent_challenge=${challenge}`
    const consentRes = await fetch(consentUrl, { signal: controller.signal })

    if (!consentRes.ok) {
      return returnErr(lang, 'oauth.server_error.internal')
    }

    const consentRequest: ConsentRequest = await consentRes.json()

    let userLang = lang
    let email = ''

    if (consentRequest.context) {
      if (typeof consentRequest.context.lang === 'string') {
        userLang = consentRequest.context.lang
      }
      if (typeof consentRequest.context.email === 'string') {
        email = consentRequest.context.email
      }
    }

    const expiry = parseInt(process.env.ACCESS_TOKEN_EXPIRY_WEB_HOURS || '240')
    const audience = process.env.OAUTH_GRANT_ACCESS_TOKEN_AUDIENCE?.split(',') || []

    const acceptBody = {
      grant_scope: consentRequest.requested_scope,
      grant_access_token_audience: audience,
      remember: true,
      remember_for: expiry * 60 * 60,
      session: {
        id_token: { email },
      },
    }

    const acceptUrl = `${process.env.OAUTH_ADMIN_URL}/oauth2/auth/requests/consent/accept?consent_challenge=${challenge}`
    const acceptRes = await fetch(acceptUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(acceptBody),
      signal: controller.signal,
    })

    if (!acceptRes.ok) return returnErr(userLang, 'oauth.unknown_error')

    const result: ConsentAcceptResult = await acceptRes.json()
    if (!result.redirect_to) return returnErr(userLang, 'oauth.unknown_error')

    return NextResponse.redirect(result.redirect_to)
  } catch (error) {
    return returnErr(lang, 'oauth.server_error.internal')
  } finally {
    clearTimeout(timeout)
  }
}
