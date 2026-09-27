import { prisma } from './db'

export const YOUTUBE_SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube.readonly',
]

export function isYouTubeConfigured() {
  return Boolean(process.env.YOUTUBE_CLIENT_ID && process.env.YOUTUBE_CLIENT_SECRET)
}

export function getRedirectUri() {
  const base = (process.env.NEXTAUTH_URL ?? 'http://localhost:3000').replace(/\/$/, '')
  return `${base}/api/youtube/callback`
}

export async function exchangeCode(code: string) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.YOUTUBE_CLIENT_ID ?? '',
      client_secret: process.env.YOUTUBE_CLIENT_SECRET ?? '',
      redirect_uri: getRedirectUri(),
      grant_type: 'authorization_code',
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data?.error_description ?? data?.error ?? 'Token exchange failed')
  return data as { access_token: string; refresh_token?: string }
}

export async function getAccessToken(): Promise<string> {
  const conn = await prisma.youTubeConnection.findUnique({ where: { id: 'default' } })
  if (!conn) throw new Error('YouTube channel is not connected')
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.YOUTUBE_CLIENT_ID ?? '',
      client_secret: process.env.YOUTUBE_CLIENT_SECRET ?? '',
      refresh_token: conn.refreshToken,
      grant_type: 'refresh_token',
    }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(`YouTube auth expired — reconnect the channel (${data?.error ?? res.status})`)
  return data.access_token as string
}

export async function fetchMyChannel(accessToken: string) {
  const res = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const data = await res.json()
  const ch = data?.items?.[0]
  return { channelId: ch?.id ?? '', channelTitle: ch?.snippet?.title ?? '' }
}

interface UploadOptions {
  title: string
  description: string
  tags: string[]
  privacyStatus: 'private' | 'unlisted' | 'public'
  publishAt?: string
  videoUrl: string
  thumbnailUrl?: string
}

export async function uploadToYouTube(opts: UploadOptions): Promise<{ videoId: string; thumbnailError?: string }> {
  const token = await getAccessToken()
  const status: Record<string, unknown> = { privacyStatus: opts.publishAt ? 'private' : opts.privacyStatus, selfDeclaredMadeForKids: false }
  if (opts.publishAt) status.publishAt = opts.publishAt

  const init = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json; charset=UTF-8', 'X-Upload-Content-Type': 'video/mp4' },
    body: JSON.stringify({
      snippet: { title: opts.title.slice(0, 100), description: opts.description.slice(0, 4900), tags: opts.tags.slice(0, 30), categoryId: '28' },
      status,
    }),
  })
  if (!init.ok) throw new Error(`YouTube upload init failed: ${(await init.text()).slice(0, 400)}`)
  const uploadUrl = init.headers.get('location')
  if (!uploadUrl) throw new Error('YouTube did not return an upload URL')

  const file = await fetch(opts.videoUrl)
  if (!file.ok) throw new Error('Could not download the rendered video for upload')
  const bytes = Buffer.from(await file.arrayBuffer())
  const put = await fetch(uploadUrl, { method: 'PUT', headers: { 'Content-Type': 'video/mp4', 'Content-Length': String(bytes.length) }, body: bytes })
  const video = await put.json().catch(() => ({}))
  if (!put.ok || !video?.id) throw new Error(`YouTube upload failed: ${JSON.stringify(video).slice(0, 400)}`)

  let thumbnailError: string | undefined
  if (opts.thumbnailUrl) {
    try {
      const img = await fetch(opts.thumbnailUrl)
      const imgBytes = Buffer.from(await img.arrayBuffer())
      const t = await fetch(`https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${video.id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': img.headers.get('content-type') ?? 'image/png' },
        body: imgBytes,
      })
      if (!t.ok) thumbnailError = (await t.text()).slice(0, 300)
    } catch (e: any) {
      thumbnailError = e?.message ?? 'Thumbnail upload failed'
    }
  }
  return { videoId: video.id as string, thumbnailError }
}
