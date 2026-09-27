'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { DollarSign, ExternalLink, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface Program {
  platform: string
  name: string
  program: string
  requirements: string[]
  targets: { followers?: number; views?: number; watchHours?: number }
  applyUrl: string
  progress: { followers: number; views: number; watchHours: number; status: string; notes: string }
}

const STATUS_LABEL: Record<string, string> = {
  not_started: 'Not started', building: 'Building audience', eligible: 'Eligible', applied: 'Applied', monetized: 'Monetized',
}
const STATUS_COLOR: Record<string, string> = {
  not_started: 'bg-muted text-muted-foreground', building: 'bg-sky-500/15 text-sky-400', eligible: 'bg-amber-500/15 text-amber-400',
  applied: 'bg-violet-500/15 text-violet-400', monetized: 'bg-primary/15 text-primary',
}
const METRICS = [
  { key: 'followers', label: 'Followers' },
  { key: 'views', label: 'Views' },
  { key: 'watchHours', label: 'Watch hrs' },
] as const

function ProgramCard({ p, onSaved }: { p: Program; onSaved: (list: Program[]) => void }) {
  const [draft, setDraft] = useState(p.progress)
  const [saving, setSaving] = useState(false)
  useEffect(() => setDraft(p.progress), [p.progress])
  const metrics = METRICS.filter((m) => p.targets[m.key] !== undefined)
  const dirty = JSON.stringify(draft) !== JSON.stringify(p.progress)

  const save = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/monetization', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ platform: p.platform, ...draft }) })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error ?? 'Save failed')
      onSaved(data.programs); toast.success(`${p.name} progress saved`)
    } catch (e: any) { console.error('Monetization save failed:', e); toast.error(e?.message ?? 'Save failed') }
    finally { setSaving(false) }
  }

  return (
    <div className="rounded-xl bg-card p-5 shadow-sm border border-border/60 space-y-3 flex flex-col">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold">{p.name}</p>
          <p className="text-xs text-muted-foreground">{p.program}</p>
        </div>
        <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold border-0 ${STATUS_COLOR[draft.status] ?? STATUS_COLOR.not_started}`} aria-label={`${p.name} status`}>
          {Object.entries(STATUS_LABEL).map(([k, l]) => <option key={k} value={k} className="bg-background text-foreground">{l}</option>)}
        </select>
      </div>
      <ul className="space-y-1 text-xs text-muted-foreground list-disc pl-4">
        {p.requirements.map((r) => <li key={r}>{r}</li>)}
      </ul>
      {metrics.map((m) => {
        const target = p.targets[m.key]!
        const value = Number(draft[m.key]) || 0
        const pct = Math.min(100, Math.round((value / target) * 100))
        return (
          <div key={m.key} className="space-y-1">
            <div className="flex items-center gap-2">
              <label className="text-xs text-muted-foreground w-20 shrink-0">{m.label}</label>
              <Input type="number" min={0} value={draft[m.key]} onChange={(e) => setDraft({ ...draft, [m.key]: Number(e.target.value) })} className="h-8 text-sm" />
              <span className="text-xs text-muted-foreground whitespace-nowrap">/ {target.toLocaleString('en-US')}</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} /></div>
          </div>
        )
      })}
      <div className="mt-auto flex items-center justify-between gap-2 pt-1">
        <a href={p.applyUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">Open program <ExternalLink className="h-3 w-3" /></a>
        {dirty && <Button size="sm" onClick={save} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save</Button>}
      </div>
    </div>
  )
}

export function MonetizationTracker() {
  const [programs, setPrograms] = useState<Program[] | null>(null)
  useEffect(() => {
    fetch('/api/monetization', { cache: 'no-store' })
      .then(async (r) => { const d = await r.json(); if (!r.ok) throw new Error(d?.error ?? 'Failed to load'); setPrograms(d.programs) })
      .catch((e) => { console.error('Monetization load failed:', e); toast.error(e?.message ?? 'Failed to load monetization tracker') })
  }, [])

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-display text-xl font-semibold flex items-center gap-2"><DollarSign className="h-5 w-5 text-primary" /> Monetization tracker</h2>
        <p className="text-sm text-muted-foreground">No platform lets apps switch monetization on — apply on each site once you hit the thresholds. Update your numbers here to track progress.</p>
      </div>
      {!programs ? (
        <div className="flex justify-center py-10 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {programs.map((p) => <ProgramCard key={p.platform} p={p} onSaved={setPrograms} />)}
        </div>
      )}
    </section>
  )
}
