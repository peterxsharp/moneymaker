'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Share2, Upload, ExternalLink, Copy, Download, CheckCircle2, Link2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { api, type Integrations, type Video } from './pipeline'

interface Props {
  video: Video
  integrations: Integrations | null
  busy: boolean
  run: (label: string, fn: () => Promise<Video>) => Promise<void>
}

const AUTO: { key: 'vimeo' | 'dailymotion'; name: string; color: string }[] = [
  { key: 'vimeo', name: 'Vimeo', color: 'text-sky-400' },
  { key: 'dailymotion', name: 'Dailymotion', color: 'text-blue-400' },
]

export function DistributionSection({ video, integrations, busy, run }: Props) {
  const [privacy, setPrivacy] = useState('public')
  const [rumbleUrl, setRumbleUrl] = useState('')
  const dist = video.distribution ?? {}

  const copy = async (label: string, text: string) => {
    try { await navigator.clipboard.writeText(text); toast.success(`${label} copied`) }
    catch (e) { console.error('Clipboard failed:', e); toast.error('Could not copy — select and copy manually') }
  }
  const download = () => {
    const a = document.createElement('a'); a.href = video.videoUrl!; a.download = `${video.slug}.mp4`; a.click()
  }
  const title = video.youtubeTitle || video.topic
  const tagLine = video.tags.join(', ')

  return (
    <section className="rounded-xl bg-secondary/40 p-4 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-semibold flex items-center gap-2"><Share2 className="h-4 w-4 text-primary" /> Distribution</h4>
        <select value={privacy} onChange={(e) => setPrivacy(e.target.value)} className="rounded-md border border-input bg-background px-3 py-1.5 text-sm" aria-label="Cross-post visibility">
          <option value="public">Post as public</option>
          <option value="unlisted">Post as unlisted</option>
          <option value="private">Post as private</option>
        </select>
      </div>

      {AUTO.map((p) => {
        const entry = dist[p.key]
        const ready = !!integrations?.[p.key]
        return (
          <div key={p.key} className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-background/60 px-4 py-3">
            <div className="text-sm">
              <p className={`font-medium ${p.color}`}>{p.name}</p>
              <p className="text-xs text-muted-foreground">
                {entry ? `Posted ${new Date(entry.postedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}` : ready ? 'Automatic upload ready' : 'Credentials not configured yet'}
              </p>
            </div>
            {entry ? (
              <a href={entry.url} target="_blank" rel="noreferrer">
                <Button size="sm" variant="secondary"><CheckCircle2 className="h-4 w-4 text-primary" /> View <ExternalLink className="h-3.5 w-3.5" /></Button>
              </a>
            ) : (
              <Button size="sm" disabled={busy || !ready}
                onClick={() => run(`Posting to ${p.name}`, async () => {
                  const v = await api.distribute(video.id, { platform: p.key, privacy })
                  toast.success(`Posted to ${p.name} — it may take a few minutes to finish processing there`)
                  return v
                })}>
                <Upload className="h-4 w-4" /> Post to {p.name}
              </Button>
            )}
          </div>
        )
      })}

      {/* Rumble: no public upload API, so a one-click manual kit */}
      <div className="rounded-lg bg-background/60 px-4 py-3 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="text-sm">
            <p className="font-medium text-green-400">Rumble kit</p>
            <p className="text-xs text-muted-foreground">Rumble has no public upload API — download, copy, paste. Choose the “Rumble Only” or “Excluding YouTube” license.</p>
          </div>
          {dist.rumble && (
            <div className="flex gap-1">
              <a href={dist.rumble.url} target="_blank" rel="noreferrer">
                <Button size="sm" variant="secondary"><CheckCircle2 className="h-4 w-4 text-primary" /> View <ExternalLink className="h-3.5 w-3.5" /></Button>
              </a>
              <Button size="sm" variant="ghost" aria-label="Clear Rumble link" disabled={busy}
                onClick={() => run('Clearing Rumble link', () => api.distribute(video.id, { platform: 'rumble', remove: true }))}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        {!dist.rumble && (
          <>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="secondary" onClick={download}><Download className="h-4 w-4" /> MP4</Button>
              <Button size="sm" variant="secondary" onClick={() => copy('Title', title)}><Copy className="h-4 w-4" /> Title</Button>
              <Button size="sm" variant="secondary" onClick={() => copy('Description', video.description)}><Copy className="h-4 w-4" /> Description</Button>
              <Button size="sm" variant="secondary" disabled={!tagLine} onClick={() => copy('Tags', tagLine)}><Copy className="h-4 w-4" /> Tags</Button>
              <Button size="sm" variant="secondary" onClick={() => window.open('https://rumble.com/upload.php', '_blank', 'noopener')}><ExternalLink className="h-4 w-4" /> Open Rumble upload</Button>
            </div>
            <div className="flex gap-2">
              <Input value={rumbleUrl} onChange={(e) => setRumbleUrl(e.target.value)} placeholder="Paste the rumble.com link once posted" className="text-sm" />
              <Button size="sm" disabled={busy || !rumbleUrl.trim()}
                onClick={() => run('Saving Rumble link', async () => {
                  const v = await api.distribute(video.id, { platform: 'rumble', url: rumbleUrl.trim() })
                  setRumbleUrl(''); toast.success('Rumble link saved'); return v
                })}>
                <Link2 className="h-4 w-4" /> Mark posted
              </Button>
            </div>
          </>
        )}
      </div>
      <p className="text-xs text-muted-foreground">TikTok and Instagram need vertical short clips and approved developer apps — planned for phase 2.</p>
    </section>
  )
}
