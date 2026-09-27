'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Clapperboard, Loader2, PlayCircle, Youtube, CheckCircle2, AlertTriangle, Mic, Rocket, ExternalLink, Unplug } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatCard } from '../_components/stat-card'
import { api, produceVideo, type Integrations, type Video } from './pipeline'
import { VideoPanel } from './video-panel'
import { MonetizationTracker } from './monetization-tracker'

export const STAGES = ['planned', 'scripted', 'visuals', 'voiced', 'rendered', 'published'] as const
export const STAGE_LABEL: Record<string, string> = {
  planned: 'Planned', scripted: 'Scripted', visuals: 'Visuals ready', voiced: 'Voiced', rendered: 'Rendered', published: 'Published',
}
export const STAGE_COLOR: Record<string, string> = {
  planned: 'bg-muted text-muted-foreground',
  scripted: 'bg-sky-500/15 text-sky-400',
  visuals: 'bg-violet-500/15 text-violet-400',
  voiced: 'bg-amber-500/15 text-amber-400',
  rendered: 'bg-primary/15 text-primary',
  published: 'bg-red-500/15 text-red-400',
}

const OAUTH_MESSAGES: Record<string, string> = {
  connected: 'YouTube channel connected',
  no_refresh_token: 'Google did not return a refresh token — remove the app at myaccount.google.com/permissions and connect again',
  invalid_state: 'Connection expired — please try again',
  exchange_failed: 'Could not finish connecting to YouTube',
  unauthorized: 'Sign in first, then connect YouTube',
}

export function StudioClient() {
  const [videos, setVideos] = useState<Video[]>([])
  const [integrations, setIntegrations] = useState<Integrations | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<Record<string, string>>({})
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [batchRunning, setBatchRunning] = useState(false)
  const stopBatch = useRef(false)

  const upsert = useCallback((v: Video) => setVideos((prev) => prev.map((p) => (p.id === v.id ? v : p))), [])
  const setStep = useCallback((id: string, label: string | null) =>
    setBusy((b) => { const next = { ...b }; if (label) next[id] = label; else delete next[id]; return next }), [])

  const load = useCallback(async () => {
    try {
      const data = await api.list()
      setVideos(data.videos ?? [])
      setIntegrations(data.integrations)
    } catch (e: any) {
      console.error('Load videos failed:', e)
      toast.error(e?.message ?? 'Failed to load videos')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const params = new URLSearchParams(window.location.search)
    const yt = params.get('youtube')
    if (yt) {
      if (yt === 'connected') toast.success(OAUTH_MESSAGES.connected)
      else toast.error(OAUTH_MESSAGES[yt] ?? `YouTube connection failed: ${yt}`)
      window.history.replaceState(null, '', '/youtube-studio')
    }
  }, [load])

  const produce = useCallback(async (v: Video) => {
    try {
      const done = await produceVideo(v, { tts: !!integrations?.tts, onUpdate: upsert, onStep: (s) => setStep(v.id, s) })
      toast.success(`Rendered: ${done.youtubeTitle || done.topic}`)
      return true
    } catch (e: any) {
      console.error('Produce failed:', e)
      toast.error(`#${v.order} ${e?.message ?? 'Production failed'}`)
      return false
    } finally {
      setStep(v.id, null)
    }
  }, [integrations?.tts, upsert, setStep])

  const produceAll = useCallback(async () => {
    stopBatch.current = false
    setBatchRunning(true)
    const queue = videos.filter((v) => !v.videoUrl && !v.youtubeVideoId)
    for (const v of queue) {
      if (stopBatch.current) break
      const ok = await produce(v)
      if (!ok && !integrations?.tts) break // voiceover blocked: every video would fail the same way
    }
    setBatchRunning(false)
  }, [videos, produce, integrations?.tts])

  const disconnect = async () => {
    try { await api.disconnectYouTube(); toast.success('YouTube disconnected'); load() }
    catch (e: any) { toast.error(e?.message ?? 'Failed to disconnect') }
  }

  const count = (s: string) => videos.filter((v) => v.status === s).length
  const selected = videos.find((v) => v.id === selectedId) ?? null
  const pending = videos.filter((v) => !v.videoUrl && !v.youtubeVideoId).length

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="font-display text-3xl font-bold tracking-tight flex items-center gap-3">
            <Clapperboard className="h-8 w-8 text-primary" /> YouTube Studio
          </h1>
          <p className="text-muted-foreground">TechAssist-Edge launch slate — research-locked scripts, AI visuals, voiceover, render and publish</p>
        </div>
        <div className="flex gap-2">
          {batchRunning ? (
            <Button variant="secondary" onClick={() => { stopBatch.current = true; toast('Stopping after the current video finishes') }}>
              <Loader2 className="h-4 w-4 animate-spin" /> Stop after current
            </Button>
          ) : (
            <Button onClick={produceAll} disabled={loading || pending === 0 || Object.keys(busy).length > 0}>
              <Rocket className="h-4 w-4" /> Produce all remaining ({pending})
            </Button>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Videos in slate" value={String(videos.length)} icon={Clapperboard} />
        <StatCard title="Scripted+" value={String(videos.filter((v) => v.script).length)} icon={PlayCircle} />
        <StatCard title="Rendered" value={String(count('rendered') + count('published'))} icon={CheckCircle2} />
        <StatCard title="Published" value={String(count('published'))} icon={Youtube} />
      </div>

      {integrations && (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-card p-5 shadow-sm border border-border/60 flex gap-4">
            <Mic className={`h-6 w-6 shrink-0 ${integrations.tts ? 'text-primary' : 'text-amber-400'}`} />
            <div className="space-y-1 text-sm">
              <p className="font-semibold">Voiceover engine {integrations.tts ? '— ready' : '— needs a key'}</p>
              <p className="text-muted-foreground">
                {integrations.tts
                  ? 'Narration is synthesized per scene and timed exactly to each visual.'
                  : 'Add an OpenAI API key (OPENAI_API_KEY) to enable narration. Scripts and visuals work without it.'}
              </p>
            </div>
          </div>
          <div className="rounded-xl bg-card p-5 shadow-sm border border-border/60 flex gap-4">
            <Youtube className={`h-6 w-6 shrink-0 ${integrations.youtubeConnected ? 'text-red-400' : 'text-muted-foreground'}`} />
            <div className="space-y-2 text-sm flex-1">
              <p className="font-semibold">
                YouTube {integrations.youtubeConnected ? `— connected${integrations.channelTitle ? ` to ${integrations.channelTitle}` : ''}` : '— not connected'}
              </p>
              {!integrations.youtubeConfigured ? (
                <p className="text-muted-foreground">Add a Google OAuth client (YOUTUBE_CLIENT_ID / YOUTUBE_CLIENT_SECRET) to enable one-click uploads.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {integrations.youtubeConnected ? (
                    <Button size="sm" variant="secondary" onClick={disconnect}><Unplug className="h-4 w-4" /> Disconnect</Button>
                  ) : (
                    <Button size="sm" onClick={() => { window.location.href = '/api/youtube/connect' }}><Youtube className="h-4 w-4" /> Connect channel</Button>
                  )}
                </div>
              )}
              <a href={integrations.channelUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                View channel <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {videos.map((v, i) => (
            <motion.button
              key={v.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => setSelectedId(v.id)}
              className="group text-left rounded-xl bg-card shadow-sm border border-border/60 overflow-hidden hover:border-primary/40 hover:shadow-lg transition-all"
            >
              <div className="relative aspect-video bg-muted">
                {v.thumbnailUrl ? (
                  <Image src={v.thumbnailUrl} alt={`Thumbnail for ${v.topic}`} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-transparent">
                    <span className="font-display text-5xl font-bold text-primary">#{v.order}</span>
                  </div>
                )}
                <span className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur ${STAGE_COLOR[v.status] ?? STAGE_COLOR.planned}`}>
                  {STAGE_LABEL[v.status] ?? v.status}
                </span>
                {busy[v.id] && (
                  <div className="absolute inset-x-0 bottom-0 bg-black/75 px-3 py-2 text-xs text-white flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> {busy[v.id]}
                  </div>
                )}
                {!busy[v.id] && v.rendering && (
                  <div className="absolute inset-x-0 bottom-0 bg-black/75 px-3 py-2 text-xs text-white flex items-center gap-2">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Rendering…
                  </div>
                )}
              </div>
              <div className="p-4 space-y-1.5">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">Video {v.order}</p>
                <h3 className="font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">{v.youtubeTitle || v.topic}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{v.angle}</p>
                {v.lastError && (
                  <p className="flex items-start gap-1.5 text-xs text-amber-400 pt-1"><AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" /><span className="line-clamp-2">{v.lastError}</span></p>
                )}
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {integrations && (
        <p className="text-xs text-muted-foreground">
          Cross-posting: Vimeo {integrations.vimeo ? 'ready' : 'not configured'} · Dailymotion {integrations.dailymotion ? 'ready' : 'not configured'} · Rumble via manual kit — open any rendered video to distribute.
        </p>
      )}

      <MonetizationTracker />

      <VideoPanel
        video={selected}
        integrations={integrations}
        busyLabel={selected ? busy[selected.id] ?? null : null}
        onClose={() => setSelectedId(null)}
        onUpdate={upsert}
        onStep={setStep}
        onProduce={produce}
      />
    </div>
  )
}
