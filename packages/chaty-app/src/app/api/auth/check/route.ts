import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { jwtDecode, JwtPayload } from 'jwt-decode'

import { system, Trans } from '@/lib/server'
import { ServerCookies } from '@/types/server'

interface IdTokenPayload extends JwtPayload {
  email: string
}

const REFRESH_THRESHOLD = 0.2

export async function GET(_req: NextRequest) {
  let lang = await Trans.getUserLang()
  const tr = Trans.tr
  let c = await cookies()

  let accessToken = c.get(ServerCookies.AccessToken)?.value ?? ''
  let refreshToken = c.get(ServerCookies.RefreshToken)?.value ?? ''
  let idToken = c.get(ServerCookies.IdToken)?.value ?? ''

  let shouldRefresh = false
  let email: string | undefined

  try {
    await system()

    if (!accessToken || !refreshToken || !idToken) {
      console.log('there is no accessToken or no refreshToken or no idToken')
      return Response.json({ message: tr(lang, 'error.unauthenticated') }, { status: 401 })
    }

    // Try to extract user info from ID token
    if (idToken) {
      try {
        const decodedIdToken = jwtDecode<IdTokenPayload>(idToken)
        email = decodedIdToken.email
      } catch (e) {
        console.error('Failed to decode ID token, forcing refresh or re-login', e)
        shouldRefresh = true
      }
    } else {
      shouldRefresh = true
    }

    // Check if access token needs refresh
    if (accessToken && !shouldRefresh) {
      try {
        const decodedToken = jwtDecode(accessToken)
        const now = Math.floor(Date.now() / 1000)

        if (decodedToken.exp && decodedToken.iat) {
          const totalLifetime = decodedToken.exp - decodedToken.iat
          const timeRemaining = decodedToken.exp - now
          if (timeRemaining / totalLifetime < REFRESH_THRESHOLD) {
            shouldRefresh = true
          }
        }
      } catch (error) {
        console.error('Failed to decode access token, forcing refresh or re-login:', error)
        shouldRefresh = true
      }
    } else if (!accessToken) {
      shouldRefresh = true
    }

    // Refresh tokens if needed
    if (shouldRefresh) {
      const oauthClientId = process.env.OAUTH_CLIENT_ID ?? ''
      const oauthClientSecret = process.env.OAUTH_CLIENT_SECRET ?? ''
      const oauthProviderUrl = process.env.OAUTH_PROVIDER_URL ?? ''
      const oauthRedirectUrl = process.env.OAUTH_REDIRECT_URL ?? ''

      if (!oauthProviderUrl || !oauthClientId || !oauthClientSecret) {
        console.error('Missing OAuth configuration')
        return Response.json({ message: tr(lang, 'oauth.server_error.internal') }, { status: 500 })
      }

      try {
        const tokenResponse = await fetch(`${oauthProviderUrl}/oauth2/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: 'Basic ' + Buffer.from(`${oauthClientId}:${oauthClientSecret}`).toString('base64'),
          },
          body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            redirect_uri: oauthRedirectUrl,
          }),
        })

        if (!tokenResponse.ok) {
          c.set(ServerCookies.AccessToken, '', { maxAge: 0, path: '/' })
          c.set(ServerCookies.RefreshToken, '', { maxAge: 0, path: '/' })
          c.set(ServerCookies.IdToken, '', { maxAge: 0, path: '/' })
          return Response.json({ message: tr(lang, 'error.unauthenticated') }, { status: 401 })
        }

        const tokens = await tokenResponse.json()
        const { access_token, refresh_token: new_refresh_token, expires_in, id_token: new_id_token } = tokens

        // Extract updated user info from new ID token
        if (new_id_token) {
          try {
            const newDecodedIdToken = jwtDecode<IdTokenPayload>(new_id_token)
            email = newDecodedIdToken.email
          } catch (e) {
            console.error('Could not decode new ID token to get email', e)
            return Response.json({ message: tr(lang, 'oauth.server_error.internal') }, { status: 500 })
          }
        }

        // Set new cookies
        const refreshExpiry = parseInt(process.env.OAUTH_REFRESH_TOKEN_EXPIRY_WEB_HOURS || '720')
        const secure = process.env['NODE_ENV'] === 'production'
        const cookieOptions = {
          httpOnly: true,
          secure,
          path: '/',
          sameSite: 'lax' as const,
        }

        c.set(ServerCookies.AccessToken, access_token, { ...cookieOptions, maxAge: expires_in })
        c.set(ServerCookies.IdToken, new_id_token, { ...cookieOptions, maxAge: expires_in })
        c.set(ServerCookies.RefreshToken, new_refresh_token, {
          ...cookieOptions,
          maxAge: refreshExpiry * 60 * 60,
        })

        return Response.json({ email }, { status: 200 })
      } catch (error) {
        console.error('Token refresh failed:', error)
        return Response.json({ message: tr(lang, 'oauth.server_error.internal') }, { status: 500 })
      }
    }

    return Response.json({ email }, { status: 200 })
  } catch (err) {
    return Response.json({ message: tr(lang, 'oauth.server_error.internal') }, { status: 500 })
  }
}
