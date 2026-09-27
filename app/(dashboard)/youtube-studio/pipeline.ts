import type { SerializedVideo } from '@/lib/videos'

export type Video = SerializedVideo
export interface Integrations {
  tts: boolean
  youtubeConfigured: boolean
  youtubeConnected: boolean
  channelTitle: string
  channelUrl: string
  vimeo: boolean
  dailymotion: boolean
}

async function json<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data?.error ?? `Request failed (${res.status})`)
  return data as T
}

const post = (url: string, body?: unknown) =>
  fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body ?? {}) })

export const api = {
  list: () => fetch('/api/videos', { cache: 'no-store' }).then((r) => json<{ videos: Video[]; integrations: Integrations }>(r)),
  patch: (id: string, body: Record<string, unknown>) =>
    fetch(`/api/videos/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then((r) => json<Video>(r)),
  visual: (id: string, target: 'thumbnail' | number) => post(`/api/videos/${id}/visuals`, { target }).then((r) => json<Video>(r)),
  voice: (id: string, sceneIndex: number) => post(`/api/videos/${id}/voiceover`, { sceneIndex }).then((r) => json<Video>(r)),
  startRender: (id: string) => post(`/api/videos/${id}/render`).then((r) => json<Video>(r)),
  pollRender: (id: string) => fetch(`/api/videos/${id}/render`, { cache: 'no-store' }).then((r) => json<Video>(r)),
  publish: (id: string, privacyStatus: string, useSchedule: boolean) =>
    post(`/api/videos/${id}/publish`, { privacyStatus, useSchedule }).then((r) => json<Video>(r)),
  distribute: (id: string, body: { platform: 'vimeo' | 'dailymotion' | 'rumble'; privacy?: string; url?: string; remove?: boolean }) =>
    post(`/api/videos/${id}/distribute`, body).then((r) => json<Video>(r)),
  disconnectYouTube: () => fetch('/api/youtube/connect', { method: 'DELETE' }).then((r) => json<{ ok: boolean }>(r)),

  /** Streams script generation; resolves with the updated video. */
  async script(id: string, notes: string, onChars?: (n: number) => void): Promise<Video> {
    const res = await post(`/api/videos/${id}/script`, { notes })
    if (!res.ok || !res.body) return json<Video>(res)
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let partial = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      partial += decoder.decode(value, { stream: true })
      const lines = partial.split('\n')
      partial = lines.pop() ?? ''
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        let msg: any
        try { msg = JSON.parse(line.slice(6)) } catch { continue }
        if (msg.status === 'processing') onChars?.(msg.chars ?? 0)
        else if (msg.status === 'completed') return msg.result as Video
        else if (msg.status === 'error') throw new Error(msg.message ?? 'Script generation failed')
      }
    }
    throw new Error('Script stream ended unexpectedly')
  },
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

/** Waits for an in-flight render to finish (polls every 6s, up to ~20 min). */
export async function waitForRender(id: string, onUpdate: (v: Video) => void): Promise<Video> {
  for (let i = 0; i < 200; i++) {
    await sleep(6000)
    const v = await api.pollRender(id)
    onUpdate(v)
    if (v.videoUrl) return v
    if (!v.rendering) throw new Error(v.lastError ?? 'Render failed')
  }
  throw new Error('Render is taking longer than expected — check back later')
}

/**
 * Runs every missing step for one video: script → thumbnail → scene images → voiceover → render.
 * Skips anything that already exists, so it is safe to re-run after a failure.
 */
export async function produceVideo(
  start: Video,
  opts: { tts: boolean; onUpdate: (v: Video) => void; onStep: (label: string) => void },
): Promise<Video> {
  let v = start
  const set = (next: Video) => { v = next; opts.onUpdate(next) }

  if (!v.script) {
    opts.onStep('Writing script')
    set(await api.script(v.id, '', (n) => opts.onStep(`Writing script (${n.toLocaleString('en-US')} chars)`)))
  }
  const n = v.script?.scenes?.length ?? 0
  if (!v.thumbnailUrl) {
    opts.onStep('Generating thumbnail')
    set(await api.visual(v.id, 'thumbnail'))
  }
  for (let i = 0; i < n; i++) {
    if (v.sceneImageUrls[i]) continue
    opts.onStep(`Generating scene image ${i + 1}/${n}`)
    set(await api.visual(v.id, i))
  }
  if (!opts.tts) throw new Error('Voiceover needs OPENAI_API_KEY — script and visuals are ready')
  for (let i = 0; i < n; i++) {
    if (v.voiceClips[i]) continue
    opts.onStep(`Recording voiceover ${i + 1}/${n}`)
    set(await api.voice(v.id, i))
  }
  if (!v.videoUrl) {
    if (!v.rendering) {
      opts.onStep('Starting render')
      set(await api.startRender(v.id))
    }
    opts.onStep('Rendering video (a few minutes)')
    set(await waitForRender(v.id, opts.onUpdate))
  }
  return v
}
