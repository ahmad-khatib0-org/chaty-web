import { ServerCookies } from '@/types/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(_req: NextRequest) {
  const response = NextResponse.json({ success: true }, { status: 200 })

  // Clear all auth-related cookies
  response.cookies.set(ServerCookies.AccessToken, '', { maxAge: 0, path: '/' })
  response.cookies.set(ServerCookies.RefreshToken, '', { maxAge: 0, path: '/' })
  response.cookies.set(ServerCookies.IdToken, '', { maxAge: 0, path: '/' })

  return response
}
