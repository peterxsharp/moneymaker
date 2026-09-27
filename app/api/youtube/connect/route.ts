export const dynamic = 'force-dynamic'

import { randomBytes } from 'crypto'
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import { prisma } from '@/lib/db'
import { YOUTUBE_SCOPES, getRedirectUri, isYouTubeConfigured } from '@/lib/youtube'

/** Starts the Google OAuth consent flow for the channel owner. */
export async function GET() {
  const denied = await requireAuth()
  if (denied) return denied
  if (!isYouTubeConfigured()) {
    return NextResponse.json({ error: 'YouTube API credentials are not configured yet' }, { status: 400 })
  }
  const state = randomBytes(16).toString('hex')
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  url.searchParams.set('client_id', process.env.YOUTUBE_CLIENT_ID ?? '')
  url.searchParams.set('redirect_uri', getRedirectUri())
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', YOUTUBE_SCOPES.join(' '))
  url.searchParams.set('access_type', 'offline')
  url.searchParams.set('prompt', 'consent')
  url.searchParams.set('state', state)
  const res = NextResponse.redirect(url.toString())
  res.cookies.set('yt_oauth_state', state, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 600, path: '/' })
  return res
}

/** Disconnects the channel. */
export async function DELETE() {
  const denied = await requireAuth()
  if (denied) return denied
  await prisma.youTubeConnection.delete({ where: { id: 'default' } }).catch(() => null)
  return NextResponse.json({ ok: true })
}
