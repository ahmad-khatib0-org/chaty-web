import { NextRequest, NextResponse } from 'next/server'

import { getOAuthRequestErrMsg, Trans } from '@/lib/server'

export async function GET(request: NextRequest) {
  const lang = await Trans.getUserLang()
  const searchParams = request.nextUrl.searchParams

  const errorCode = searchParams.get('error')
  const errorDesc = searchParams.get('error_description')
  const errorHint = searchParams.get('error_hint')
  const errorDebug = searchParams.get('error_debug')

  // TODO: audit an error with full URL
  console.log('OAuth Error:', { errorCode, errorDesc, errorHint, errorDebug })

  const errorMsg = Trans.tr(lang, 'login.error')
  const oauthErrorMsg = getOAuthRequestErrMsg(lang, errorCode || '', errorDesc || '')

  const redirectUrl = new URL(process.env.OAUTH_FRONTEND_LOGIN_ERROR_URL || '')
  redirectUrl.searchParams.set('error', encodeURIComponent(errorMsg))
  redirectUrl.searchParams.set('error_description', encodeURIComponent(oauthErrorMsg))
  redirectUrl.searchParams.set('translated', 'true')

  return NextResponse.redirect(redirectUrl.toString())
}
