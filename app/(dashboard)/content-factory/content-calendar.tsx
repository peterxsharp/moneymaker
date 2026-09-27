'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Loader2, CheckCircle, Clock, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NICHES, PLATFORMS } from '@/lib/streams'
import { toast } from 'sonner'

interface CalendarItem {
  id?: string
  day: number
  date: string
  platform: string
  niche: string
  title: string
  description: string
  status: string
}

export function ContentCalendar() {
  const [niche, setNiche] = useState<string>(NICHES[0])
  const [platform, setPlatform] = useState<string>(PLATFORMS[0])
  const [items, setItems] = useState<CalendarItem[]>([])
  const [generating, setGenerating] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/content-calendar')
      .then((r: Response) => r.json())
      .then((data: any) => {
        if (Array.isArray(data)) setItems(data)
      })
      .catch((err: any) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const generateCalendar = useCallback(async () => {
    setGenerating(true)
    try {
      const response = await fetch('/api/generate/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche, platform }),
      })

      if (!response.ok) throw new Error('Failed to generate calendar')

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let partialRead = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        partialRead += decoder.decode(value, { stream: true })
        const lines = partialRead.split('\n')
        partialRead = lines.pop() ?? ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              if (parsed?.status === 'completed' && parsed?.result?.calendar) {
                const calendarItems = (parsed?.result?.calendar ?? []).map((item: any, idx: number) => ({
                  day: item?.day ?? idx + 1,
                  date: new Date(Date.now() + idx * 86400000).toISOString(),
                  platform: item?.platform ?? platform,
                  niche: item?.niche ?? niche,
                  title: item?.title ?? `Day ${idx + 1} Content`,
                  description: item?.description ?? '',
                  status: 'pending',
                }))

                // Save to DB
                const saveRes = await fetch('/api/content-calendar', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ items: calendarItems }),
                })
                const saved = await saveRes.json()
                if (Array.isArray(saved)) setItems(saved)
                toast.success('30-day calendar generated!')
              }
            } catch {
              // skip
            }
          }
        }
      }
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to generate calendar')
    } finally {
      setGenerating(false)
    }
  }, [niche, platform])

  const toggleStatus = useCallback(async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'done' ? 'pending' : 'done'
    try {
      await fetch('/api/content-calendar', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      })
      setItems((prev: CalendarItem[]) => (prev ?? []).map((item: CalendarItem) =>
        item?.id === id ? { ...(item ?? {}), status: newStatus } : item
      ))
    } catch (err: any) {
      toast.error('Failed to update status')
    }
  }, [])

  const doneCount = (items ?? []).filter((i: CalendarItem) => i?.status === 'done').length

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <select
          value={niche}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNiche(e.target.value)}
          className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm"
        >
          {(NICHES ?? []).map((n: string) => <option key={n} value={n}>{n}</option>)}
        </select>
        <select
          value={platform}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPlatform(e.target.value)}
          className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm"
        >
          {(PLATFORMS ?? []).map((p: string) => <option key={p} value={p}>{p}</option>)}
        </select>
        <Button onClick={generateCalendar} disabled={generating} className="gap-2">
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
          Generate 30-Day Calendar
        </Button>
        {(items?.length ?? 0) > 0 && (
          <span className="text-sm text-muted-foreground ml-auto">
            {doneCount}/{items?.length ?? 0} completed
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (items?.length ?? 0) === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground">No calendar yet. Generate a 30-day content plan above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {(items ?? []).map((item: CalendarItem, i: number) => (
            <motion.div
              key={item?.id ?? i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className={`rounded-lg border p-3 transition-all cursor-pointer hover:border-primary/30 ${
                item?.status === 'done'
                  ? 'border-primary/30 bg-primary/5'
                  : 'border-border bg-card'
              }`}
              onClick={() => item?.id && toggleStatus(item.id, item?.status ?? 'pending')}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-muted-foreground">Day {item?.day ?? i + 1}</span>
                {item?.status === 'done' ? (
                  <CheckCircle className="h-4 w-4 text-primary" />
                ) : (
                  <Clock className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <p className="text-sm font-medium line-clamp-2">{item?.title}</p>
              {item?.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
              )}
              <div className="mt-2">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                  {item?.platform}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
