export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/db'
import { exchangeCode, fetchMyChannel } from '@/lib/youtube'

function back(result: string) {
  const base = (process.env.NEXTAUTH_URL ?? 'http://localhost:3000').replace(/\/$/, '')
  const res = NextResponse.redirect(`${base}/youtube-studio?youtube=${encodeURIComponent(result)}`)
  res.cookies.delete('yt_oauth_state')
  return res
}

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session?.user) return back('unauthorized')
  const params = request.nextUrl.searchParams
  if (params.get('error')) return back(params.get('error') ?? 'denied')
  const code = params.get('code')
  const state = params.get('state')
  if (!code || !state || state !== request.cookies.get('yt_oauth_state')?.value) return back('invalid_state')
  try {
    const tokens = await exchangeCode(code)
    if (!tokens.refresh_token) return back('no_refresh_token')
    const channel = await fetchMyChannel(tokens.access_token)
    await prisma.youTubeConnection.upsert({
      where: { id: 'default' },
      update: { refreshToken: tokens.refresh_token, ...channel },
      create: { id: 'default', refreshToken: tokens.refresh_token, ...channel },
    })
    return back('connected')
  } catch (e: any) {
    console.error('YouTube callback error:', e)
    return back('exchange_failed')
  }
}
