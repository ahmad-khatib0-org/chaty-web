import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const challenge = request.nextUrl.searchParams.get('login_challenge')
  if (!challenge) {
    return NextResponse.json({ error: 'The login challenge token is missing from request' }, { status: 400 })
  }

  const url = `${process.env.OAUTH_FRONTEND_LOGIN_URL}?login_challenge=${challenge}`
  return NextResponse.redirect(url)
}
