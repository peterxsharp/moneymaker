'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { Loader2, Wand2, ImageIcon, Mic, Film, Youtube, Save, RefreshCw, ExternalLink, Download, BookOpen } from 'lucide-react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { api, waitForRender, type Integrations, type Video } from './pipeline'
import { DistributionSection } from './distribution-section'

const STAGE_LABEL: Record<string, string> = {
  planned: 'Planned', scripted: 'Scripted', visuals: 'Visuals ready', voiced: 'Voiced', rendered: 'Rendered', published: 'Published',
}

function toLocalInput(iso: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

interface Props {
  video: Video | null
  integrations: Integrations | null
  busyLabel: string | null
  onClose: () => void
  onUpdate: (v: Video) => void
  onStep: (id: string, label: string | null) => void
  onProduce: (v: Video) => Promise<boolean>
}

export function VideoPanel({ video, integrations, busyLabel, onClose, onUpdate, onStep, onProduce }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState('')
  const [schedule, setSchedule] = useState('')
  const [narrations, setNarrations] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [privacy, setPrivacy] = useState('private')
  const [useSchedule, setUseSchedule] = useState(true)

  const vid = video?.id
  useEffect(() => {
    if (!video) return
    setTitle(video.youtubeTitle ?? '')
    setDescription(video.description ?? '')
    setTags((video.tags ?? []).join(', '))
    setSchedule(toLocalInput(video.scheduledFor))
    setNarrations((video.script?.scenes ?? []).map((s) => s.narration))
  }, [vid, video?.script, video?.description])

  if (!video) return <Sheet open={false} onOpenChange={() => onClose()}><SheetContent className="hidden" /></Sheet>

  const busy = !!busyLabel
  const scenes = video.script?.scenes ?? []

  /** Runs one step with a busy label and error toast. */
  const run = async (label: string, fn: () => Promise<Video>) => {
    onStep(video.id, label)
    try { onUpdate(await fn()) }
    catch (e: any) { console.error(`${label} failed:`, e); toast.error(e?.message ?? `${label} failed`) }
    finally { onStep(video.id, null) }
  }

  const saveMeta = () => run('Saving', () => api.patch(video.id, {
    youtubeTitle: title,
    description,
    tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    scheduledFor: schedule ? new Date(schedule).toISOString() : null,
  })).then(() => toast.success('Details saved'))

  const saveNarration = () => run('Saving narration', () => api.patch(video.id, { sceneNarrations: narrations }))
    .then(() => toast.success('Narration saved — changed scenes need new voiceover'))

  const render = () => run('Rendering video', async () => {
    let v = video.rendering ? video : await api.startRender(video.id)
    onUpdate(v)
    v = await waitForRender(video.id, onUpdate)
    toast.success('Render complete')
    return v
  })

  const publish = () => run('Uploading to YouTube', async () => {
    const v = await api.publish(video.id, privacy, useSchedule)
    toast.success('Uploaded to YouTube')
    return v
  })

  const narrationDirty = scenes.some((s, i) => narrations[i] !== undefined && narrations[i] !== s.narration)
  const allReady = scenes.length > 0 && scenes.every((_, i) => video.sceneImageUrls[i] && video.voiceClips[i])
  const canPublish = !!video.videoUrl && !video.youtubeVideoId && !!integrations?.youtubeConnected

  return (
    <Sheet open onOpenChange={(o) => { if (!o) onClose() }}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
        <div className="p-6 space-y-6">
          <SheetHeader className="space-y-2 text-left">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Video {video.order} · {STAGE_LABEL[video.status] ?? video.status}</p>
            <SheetTitle className="font-display text-xl leading-snug">{video.youtubeTitle || video.topic}</SheetTitle>
            <SheetDescription>{video.angle}</SheetDescription>
          </SheetHeader>

          {busyLabel && (
            <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-3 text-sm text-primary">
              <Loader2 className="h-4 w-4 animate-spin" /> {busyLabel}
            </div>
          )}
          {video.lastError && !busy && <p className="rounded-lg bg-amber-500/10 px-4 py-3 text-sm text-amber-400">{video.lastError}</p>}

          {/* Primary actions */}
          <div className="flex flex-wrap gap-2">
            {!video.videoUrl && (
              <Button onClick={() => onProduce(video)} disabled={busy}><Wand2 className="h-4 w-4" /> Produce everything missing</Button>
            )}
            {allReady && !video.youtubeVideoId && (
              <Button variant={video.videoUrl ? 'secondary' : 'default'} onClick={render} disabled={busy}>
                <Film className="h-4 w-4" /> {video.videoUrl ? 'Re-render' : video.rendering ? 'Resume render' : 'Render video'}
              </Button>
            )}
          </div>

          {video.videoUrl && (
            <section className="space-y-3">
              <video src={video.videoUrl} controls className="w-full rounded-lg bg-black aspect-video" />
              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="secondary" onClick={() => { const a = document.createElement('a'); a.href = video.videoUrl!; a.download = `${video.slug}.mp4`; a.click() }}>
                  <Download className="h-4 w-4" /> Download MP4
                </Button>
                {video.youtubeVideoId && (
                  <a href={`https://studio.youtube.com/video/${video.youtubeVideoId}/edit`} target="_blank" rel="noreferrer">
                    <Button size="sm" variant="secondary"><ExternalLink className="h-4 w-4" /> Open in YouTube Studio</Button>
                  </a>
                )}
              </div>
            </section>
          )}

          {/* Publish */}
          {video.videoUrl && !video.youtubeVideoId && (
            <section className="rounded-xl bg-secondary/40 p-4 space-y-3">
              <h4 className="font-semibold flex items-center gap-2"><Youtube className="h-4 w-4 text-red-400" /> Publish</h4>
              {!integrations?.youtubeConnected ? (
                <p className="text-sm text-muted-foreground">Connect your YouTube channel (top of the page) to upload directly, or download the MP4 and upload it manually.</p>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <select value={privacy} onChange={(e) => setPrivacy(e.target.value)} className="rounded-md border border-input bg-background px-3 py-2">
                      <option value="private">Private</option>
                      <option value="unlisted">Unlisted</option>
                      <option value="public">Public</option>
                    </select>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={useSchedule} onChange={(e) => setUseSchedule(e.target.checked)} className="accent-primary" />
                      Use scheduled time (goes public automatically)
                    </label>
                  </div>
                  <Button onClick={publish} disabled={busy || !canPublish}><Youtube className="h-4 w-4" /> Upload to YouTube</Button>
                </>
              )}
            </section>
          )}

          {video.videoUrl && <DistributionSection video={video} integrations={integrations} busy={busy} run={run} />}

          {/* Metadata */}
          {video.script && (
            <section className="space-y-3">
              <h4 className="font-semibold">YouTube details</h4>
              <Input value={title} maxLength={100} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
              {(video.script.altTitles ?? []).length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {video.script.altTitles!.map((t) => (
                    <button key={t} onClick={() => setTitle(t)} className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground hover:text-foreground">{t}</button>
                  ))}
                </div>
              )}
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={8} placeholder="Description" />
              <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags, comma separated" />
              <div className="flex flex-wrap items-center gap-3">
                <label className="text-sm text-muted-foreground">Scheduled for</label>
                <Input type="datetime-local" value={schedule} onChange={(e) => setSchedule(e.target.value)} className="w-auto" />
              </div>
              <Button size="sm" onClick={saveMeta} disabled={busy}><Save className="h-4 w-4" /> Save details</Button>
            </section>
          )}

          {/* Script */}
          <section className="space-y-3">
            <h4 className="font-semibold">Script</h4>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Optional producer notes (e.g. focus more on budget builds)" />
            <Button size="sm" variant={video.script ? 'secondary' : 'default'} disabled={busy}
              onClick={() => run('Writing script', () => api.script(video.id, notes, (n) => onStep(video.id, `Writing script (${n.toLocaleString('en-US')} chars)`)))}>
              <RefreshCw className="h-4 w-4" /> {video.script ? 'Rewrite script (resets media)' : 'Write script'}
            </Button>
          </section>

          {video.script && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Thumbnail</h4>
                <Button size="sm" variant="ghost" disabled={busy} onClick={() => run('Generating thumbnail', () => api.visual(video.id, 'thumbnail'))}>
                  <ImageIcon className="h-4 w-4" /> {video.thumbnailUrl ? 'Regenerate' : 'Generate'}
                </Button>
              </div>
              <div className="relative aspect-video rounded-lg bg-muted overflow-hidden">
                {video.thumbnailUrl && <Image src={video.thumbnailUrl} alt={`Thumbnail for ${video.topic}`} fill className="object-cover" sizes="640px" />}
                {video.script.thumbnailText && (
                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 via-black/20 to-transparent p-4">
                    <span className="font-display text-2xl font-extrabold uppercase text-white drop-shadow">{video.script.thumbnailText}</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Suggested headline overlay: “{video.script.thumbnailText}” — the uploaded thumbnail is the clean image; add the headline in Canva if you want text on it.</p>

              <div className="flex items-center justify-between pt-2">
                <h4 className="font-semibold">Scenes ({scenes.length})</h4>
                {narrationDirty && <Button size="sm" onClick={saveNarration} disabled={busy}><Save className="h-4 w-4" /> Save narration</Button>}
              </div>
              {scenes.map((s, i) => (
                <div key={i} className="rounded-xl bg-secondary/40 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm">{i + 1}. {s.heading}</p>
                    {s.onScreenText && <span className="text-[11px] rounded bg-primary/10 px-2 py-0.5 text-primary">{s.onScreenText}</span>}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
                    <div className="space-y-2">
                      <div className="relative aspect-video rounded-md bg-muted overflow-hidden">
                        {video.sceneImageUrls[i] && <Image src={video.sceneImageUrls[i]!} alt={`Scene ${i + 1}: ${s.heading}`} fill className="object-cover" sizes="180px" />}
                      </div>
                      <Button size="sm" variant="ghost" className="w-full" disabled={busy} onClick={() => run(`Generating scene image ${i + 1}`, () => api.visual(video.id, i))}>
                        <ImageIcon className="h-4 w-4" /> {video.sceneImageUrls[i] ? 'Regenerate' : 'Generate'}
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Textarea value={narrations[i] ?? ''} rows={5} onChange={(e) => setNarrations((n) => { const c = [...n]; c[i] = e.target.value; return c })} className="text-sm" />
                      <div className="flex flex-wrap items-center gap-2">
                        {video.voiceClips[i] && <audio src={video.voiceClips[i]!.url} controls className="h-8 max-w-full" />}
                        <Button size="sm" variant="ghost" disabled={busy || !integrations?.tts || narrations[i] !== s.narration}
                          onClick={() => run(`Recording voiceover ${i + 1}`, () => api.voice(video.id, i))}>
                          <Mic className="h-4 w-4" /> {video.voiceClips[i] ? `Re-record (${video.voiceClips[i]!.duration.toFixed(1)}s)` : 'Record voiceover'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Research */}
          <details className="rounded-xl bg-secondary/40 p-4">
            <summary className="cursor-pointer font-semibold flex items-center gap-2"><BookOpen className="h-4 w-4" /> Research fact sheet (script is locked to this)</summary>
            <p className="mt-3 whitespace-pre-line text-sm text-muted-foreground">{video.factSheet}</p>
            {video.sources.length > 0 && (
              <ul className="mt-3 space-y-1 text-xs">
                {video.sources.map((s) => (
                  <li key={s}><a href={s} target="_blank" rel="noreferrer" className="text-primary hover:underline break-all">{s}</a></li>
                ))}
              </ul>
            )}
          </details>
        </div>
      </SheetContent>
    </Sheet>
  )
}
