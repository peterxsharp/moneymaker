/** Cross-posting to Vimeo and Dailymotion, plus monetization program reference data. */

export interface CrossPostInput {
  title: string
  description: string
  tags: string[]
  videoUrl: string
  thumbnailUrl?: string
  privacy: 'public' | 'unlisted' | 'private'
}
export interface CrossPostResult { externalId: string; url: string; warning?: string }

export const isVimeoConfigured = () => Boolean(process.env.VIMEO_ACCESS_TOKEN)
export const isDailymotionConfigured = () => Boolean(
  process.env.DAILYMOTION_API_KEY && process.env.DAILYMOTION_API_SECRET &&
  process.env.DAILYMOTION_USERNAME && process.env.DAILYMOTION_PASSWORD,
)

async function readError(res: Response) {
  const text = await res.text().catch(() => '')
  try {
    const j = JSON.parse(text)
    return j?.developer_message ?? j?.error_description ?? j?.error?.message ?? j?.error ?? text
  } catch { return text || `HTTP ${res.status}` }
}

/* ---------------- Vimeo (pull upload: Vimeo fetches the MP4 from our public URL) ---------------- */

const VIMEO_HEADERS = () => ({
  Authorization: `bearer ${process.env.VIMEO_ACCESS_TOKEN}`,
  'Content-Type': 'application/json',
  Accept: 'application/vnd.vimeo.*+json;version=3.4',
})

export async function uploadToVimeo(input: CrossPostInput): Promise<CrossPostResult> {
  const head = await fetch(input.videoUrl, { method: 'HEAD' })
  const size = Number(head.headers.get('content-length') ?? 0)
  if (!head.ok || !size) throw new Error('Could not read the rendered MP4 size')

  const view = input.privacy === 'public' ? 'anybody' : input.privacy === 'unlisted' ? 'unlisted' : 'nobody'
  const res = await fetch('https://api.vimeo.com/me/videos', {
    method: 'POST',
    headers: VIMEO_HEADERS(),
    body: JSON.stringify({
      upload: { approach: 'pull', size, link: input.videoUrl },
      name: input.title.slice(0, 128),
      description: input.description.slice(0, 5000),
      privacy: { view },
    }),
  })
  if (!res.ok) throw new Error(`Vimeo: ${await readError(res)}`)
  const data = await res.json()
  const externalId = String(data?.uri ?? '').split('/').pop() ?? ''
  if (!externalId) throw new Error('Vimeo did not return a video id')

  let warning: string | undefined
  if (input.tags.length) {
    const t = await fetch(`https://api.vimeo.com/videos/${externalId}/tags`, {
      method: 'PUT',
      headers: VIMEO_HEADERS(),
      body: JSON.stringify(input.tags.slice(0, 20).map((name) => ({ name }))),
    })
    if (!t.ok) warning = `Uploaded, but tags failed: ${await readError(t)}`
  }
  return { externalId, url: data?.link ?? `https://vimeo.com/${externalId}`, warning }
}

/* ---------------- Dailymotion (password grant + upload server) ---------------- */

async function dailymotionToken(): Promise<string> {
  const res = await fetch('https://api.dailymotion.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'password',
      client_id: process.env.DAILYMOTION_API_KEY ?? '',
      client_secret: process.env.DAILYMOTION_API_SECRET ?? '',
      username: process.env.DAILYMOTION_USERNAME ?? '',
      password: process.env.DAILYMOTION_PASSWORD ?? '',
      scope: 'manage_videos',
    }),
  })
  if (!res.ok) throw new Error(`Dailymotion sign-in: ${await readError(res)}`)
  const data = await res.json()
  if (!data?.access_token) throw new Error('Dailymotion did not return an access token')
  return data.access_token as string
}

export async function uploadToDailymotion(input: CrossPostInput): Promise<CrossPostResult> {
  const token = await dailymotionToken()
  const auth = { Authorization: `Bearer ${token}` }

  const up = await fetch('https://api.dailymotion.com/file/upload', { headers: auth })
  if (!up.ok) throw new Error(`Dailymotion upload URL: ${await readError(up)}`)
  const { upload_url } = await up.json()

  const mp4 = await fetch(input.videoUrl)
  if (!mp4.ok) throw new Error('Could not download the rendered MP4')
  const form = new FormData()
  form.append('file', new Blob([await mp4.arrayBuffer()], { type: 'video/mp4' }), 'video.mp4')
  const sent = await fetch(upload_url, { method: 'POST', body: form })
  if (!sent.ok) throw new Error(`Dailymotion file upload: ${await readError(sent)}`)
  const { url: fileUrl } = await sent.json()
  if (!fileUrl) throw new Error('Dailymotion upload server did not return a file URL')

  const params = new URLSearchParams({
    url: fileUrl,
    title: input.title.slice(0, 255),
    description: input.description.slice(0, 3000),
    tags: input.tags.slice(0, 20).join(','),
    channel: 'tech',
    published: 'true',
    is_created_for_kids: 'false',
    private: input.privacy === 'public' ? 'false' : 'true',
  })
  if (input.thumbnailUrl) params.set('thumbnail_url', input.thumbnailUrl)
  const created = await fetch('https://api.dailymotion.com/me/videos', {
    method: 'POST',
    headers: { ...auth, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params,
  })
  if (!created.ok) throw new Error(`Dailymotion publish: ${await readError(created)}`)
  const data = await created.json()
  if (!data?.id) throw new Error('Dailymotion did not return a video id')
  return { externalId: data.id, url: `https://www.dailymotion.com/video/${data.id}` }
}

/* ---------------- Monetization programs (researched Sep 2026; verify on each platform) ---------------- */

export interface MonetizationProgram {
  platform: string
  name: string
  program: string
  requirements: string[]
  targets: { followers?: number; views?: number; watchHours?: number }
  applyUrl: string
}

export const MONETIZATION_PROGRAMS: MonetizationProgram[] = [
  {
    platform: 'youtube', name: 'YouTube', program: 'YouTube Partner Program',
    requirements: ['1,000 subscribers', '4,000 public watch hours in the last 12 months (or 10M Shorts views in 90 days)', 'Early tier (fan funding): 500 subs, 3 uploads in 90 days, 3,000 watch hours'],
    targets: { followers: 1000, watchHours: 4000 }, applyUrl: 'https://studio.youtube.com/',
  },
  {
    platform: 'dailymotion', name: 'Dailymotion', program: 'Dailymotion Partner Program',
    requirements: ['1,000 cumulative views (monetization then auto-enables)', '18+, own all rights, account in good standing', '$100 minimum payout'],
    targets: { views: 1000 }, applyUrl: 'https://www.dailymotion.com/partner',
  },
  {
    platform: 'rumble', name: 'Rumble', program: 'Rumble Partner Program (video licensing)',
    requirements: ['No follower/view minimum', 'Choose a license on upload — pick “Rumble Only” or “Excluding YouTube” so your YouTube monetization is unaffected', 'Creator Program (live streaming) needs 100 followers + Premium'],
    targets: {}, applyUrl: 'https://rumble.com/account/dashboard',
  },
  {
    platform: 'vimeo', name: 'Vimeo', program: 'Vimeo On Demand / OTT',
    requirements: ['No ad revenue sharing on Vimeo', 'Earn by selling or renting videos, which requires a paid Vimeo plan', 'Best used as a clean, ad-free portfolio/embed host'],
    targets: {}, applyUrl: 'https://vimeo.com/ondemand',
  },
  {
    platform: 'tiktok', name: 'TikTok', program: 'Creator Rewards Program (phase 2)',
    requirements: ['18+', '10,000 followers', '100,000 views in the last 30 days', 'Videos over 1 minute'],
    targets: { followers: 10000, views: 100000 }, applyUrl: 'https://www.tiktok.com/creators',
  },
  {
    platform: 'instagram', name: 'Instagram', program: 'Gifts / Subscriptions / Ads on Reels (phase 2)',
    requirements: ['Professional (Creator/Business) account, 18+', 'Gifts: 500 followers', 'Subscriptions & Ads on Reels: 10,000 followers (+600k minutes viewed in 60 days for ads)'],
    targets: { followers: 10000 }, applyUrl: 'https://www.instagram.com/accounts/professional_dashboard/',
  },
]

export const PROGRESS_STATUSES = ['not_started', 'building', 'eligible', 'applied', 'monetized'] as const
