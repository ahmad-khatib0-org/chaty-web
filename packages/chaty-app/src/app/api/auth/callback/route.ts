import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import { encodeQueryParams, getOAuthRequestErrMsg, Trans } from '@/lib/server'
import { ServerCookies } from '@/types/server'

export async function GET(req: NextRequest) {
  const tr = Trans.tr
  const lang = await Trans.getUserLang()
  const url = new URL(req.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')

  const error = url.searchParams.get('error')
  const errorDesc = url.searchParams.get('error_description')

  const returnErr = (descID: string, error?: any) => {
    console.log(error)
    const msg = tr(lang, 'login.error')
    const desc = tr(lang, descID)
    const params = encodeQueryParams({ error: msg, error_description: desc, translated: true })
    const url = new URL(`/auth/login/error?${params}`, req.nextUrl.origin)
    return NextResponse.redirect(url, 302)
  }

  if (error) {
    const errorMsg = Trans.tr(lang, 'login.error')
    const oauthErrorMsg = getOAuthRequestErrMsg(lang, error, errorDesc || '')

    const params = encodeQueryParams({
      error: errorMsg,
      error_description: oauthErrorMsg,
      translated: 'true',
    })
    const redirectUrl = new URL(process.env.OAUTH_FRONTEND_LOGIN_ERROR_URL || '')
    return NextResponse.redirect(`${redirectUrl}?${params}`)
  }

  // Verify State
  const storedState = (await cookies()).get('oauth_state')?.value
  if (!state || state !== storedState) return returnErr('oauth.login_state.invalid')

  if (!code) return returnErr('oauth.login_code.invalid')

  // Exchange code for tokens
  const oauthClientId = process.env.OAUTH_CLIENT_ID ?? ''
  const oauthClientSecret = process.env.OAUTH_CLIENT_SECRET ?? ''
  const res = await fetch(`${process.env['OAUTH_PROVIDER_URL'] ?? ''}/oauth2/token`, {
    method: 'POST',
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.OAUTH_REDIRECT_URL ?? '',
    }),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: 'Basic ' + Buffer.from(`${oauthClientId}:${oauthClientSecret}`).toString('base64'),
    },
  })

  if (!res.ok) return returnErr('oauth.unknown_error', await res.text())

  const tokens = await res.json()
  const { access_token, refresh_token, expires_in, id_token } = tokens

  // Set JWTs in HTTP-only cookies
  const response = NextResponse.redirect(new URL('/', req.url))

  const secure = process.env.NODE_ENV === 'production' && req.nextUrl.protocol === 'https:'

  response.cookies.set('oauth_state', '', { maxAge: 0, path: '/' })
  response.cookies.set(ServerCookies.AccessToken, access_token, {
    httpOnly: true,
    secure,
    path: '/',
    maxAge: expires_in,
    // sameSite: secure ? 'lax' : 'none',
    domain: secure ? undefined : 'localhost',
  })

  const refreshExpiry = parseInt(process.env.OAUTH_REFRESH_TOKEN_EXPIRY_WEB_HOURS || '720')
  response.cookies.set(ServerCookies.RefreshToken, refresh_token, {
    httpOnly: true,
    secure,
    path: '/',
    maxAge: refreshExpiry * 60 * 60,
    domain: secure ? undefined : 'localhost',
  })

  response.cookies.set(ServerCookies.IdToken, id_token, {
    httpOnly: true,
    secure,
    path: '/',
    maxAge: expires_in,
    // sameSite: secure ? 'lax' : 'none',
    domain: secure ? undefined : 'localhost',
  })

  return response
}
