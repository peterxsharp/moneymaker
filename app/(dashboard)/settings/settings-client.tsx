'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Settings, DollarSign, Save, Loader2, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { INCOME_STREAMS, TOTAL_SEED, DEFAULT_BUDGET } from '@/lib/streams'
import { toast } from 'sonner'

interface BudgetAlloc {
  stream: string
  amount: number
  label: string
  color: string
}

interface StreamSetting {
  stream: string
  automationScore: number
  hoursPerWeek: number
  isActive: boolean
  optimistic: number
  realistic: number
  pessimistic: number
}

export function SettingsClient() {
  const [budget, setBudget] = useState<BudgetAlloc[]>([])
  const [settings, setSettings] = useState<StreamSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/budget').then((r: Response) => r.json()).catch(() => []),
      fetch('/api/stream-settings').then((r: Response) => r.json()).catch(() => []),
    ]).then(([budgetData, settingsData]: [any, any]) => {
      if (Array.isArray(budgetData) && (budgetData?.length ?? 0) > 0) {
        setBudget(budgetData)
      } else {
        setBudget(Object.entries(DEFAULT_BUDGET ?? {}).map(([stream, data]: [string, any]) => ({
          stream,
          amount: data?.amount ?? 0,
          label: data?.label ?? stream,
          color: data?.color ?? '#10B981',
        })))
      }
      if (Array.isArray(settingsData) && (settingsData?.length ?? 0) > 0) {
        setSettings(settingsData)
      } else {
        setSettings((INCOME_STREAMS ?? []).map((s: any) => ({
          stream: s?.id ?? '',
          automationScore: 75,
          hoursPerWeek: 5,
          isActive: true,
          optimistic: 400,
          realistic: 200,
          pessimistic: 50,
        })))
      }
    }).finally(() => setLoading(false))
  }, [])

  const totalAllocated = (budget ?? []).reduce((sum: number, b: BudgetAlloc) => sum + (b?.amount ?? 0), 0)
  const remaining = TOTAL_SEED - totalAllocated

  const updateBudget = useCallback((stream: string, amount: number) => {
    setBudget((prev: BudgetAlloc[]) => {
      const current = (prev ?? []).find((b: BudgetAlloc) => b?.stream === stream)
      const currentAmount = current?.amount ?? 0
      const otherTotal = totalAllocated - currentAmount
      const maxAllowed = TOTAL_SEED - otherTotal
      const clampedAmount = Math.min(Math.max(0, amount), maxAllowed)

      return (prev ?? []).map((b: BudgetAlloc) =>
        b?.stream === stream ? { ...(b ?? {}), amount: clampedAmount } : b
      )
    })
  }, [totalAllocated])

  const updateSetting = useCallback((stream: string, field: string, value: any) => {
    setSettings((prev: StreamSetting[]) =>
      (prev ?? []).map((s: StreamSetting) =>
        s?.stream === stream ? { ...(s ?? {}), [field]: value } as StreamSetting : s
      )
    )
  }, [])

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      await fetch('/api/budget', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allocations: budget }),
      })

      for (const setting of (settings ?? [])) {
        await fetch('/api/stream-settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(setting),
        })
      }

      toast.success('Settings saved!')
    } catch (err: any) {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }, [budget, settings])

  const resetToDefaults = useCallback(() => {
    setBudget(Object.entries(DEFAULT_BUDGET ?? {}).map(([stream, data]: [string, any]) => ({
      stream,
      amount: data?.amount ?? 0,
      label: data?.label ?? stream,
      color: data?.color ?? '#10B981',
    })))
    toast.success('Reset to recommended allocation')
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-[1200px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="font-display text-3xl font-bold tracking-tight flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            Settings & Budget
          </h1>
          <p className="text-muted-foreground">Allocate your $500 seed budget and configure streams</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={resetToDefaults} className="gap-2">
            <RotateCcw className="h-4 w-4" /> Reset
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save All
          </Button>
        </div>
      </motion.div>

      {/* Budget Allocation */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border bg-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold">Budget Allocation</h3>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Allocated: <span className="font-mono text-primary">${totalAllocated}</span></span>
            <span className="text-sm text-muted-foreground">Remaining: <span className={`font-mono ${remaining >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>${remaining}</span></span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-3 rounded-full bg-secondary overflow-hidden flex">
          {(budget ?? []).filter((b: BudgetAlloc) => (b?.amount ?? 0) > 0).map((b: BudgetAlloc) => {
            const streamInfo = (INCOME_STREAMS ?? []).find((s: any) => s?.id === b?.stream)
            return (
              <div
                key={b?.stream}
                className="h-full transition-all duration-300"
                style={{ width: `${((b?.amount ?? 0) / TOTAL_SEED) * 100}%`, backgroundColor: streamInfo?.color ?? b?.color ?? '#10B981' }}
              />
            )
          })}
        </div>

        {/* Sliders */}
        <div className="space-y-4">
          {(budget ?? []).map((b: BudgetAlloc) => {
            const streamInfo = (INCOME_STREAMS ?? []).find((s: any) => s?.id === b?.stream)
            return (
              <div key={b?.stream} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: streamInfo?.color ?? '#10B981' }}>
                    {streamInfo?.label ?? b?.label}
                  </span>
                  <span className="font-mono text-sm text-primary">${b?.amount ?? 0}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={TOTAL_SEED}
                  step={10}
                  value={b?.amount ?? 0}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateBudget(b?.stream ?? '', Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            )
          })}
        </div>

        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">
            <strong className="text-primary">Recommended:</strong> $0 (YouTube/TikTok — free), $80 (domain+hosting), $150 (ad spend for affiliate), $120 (POD test orders), $150 (crypto reserve)
          </p>
        </div>
      </motion.div>

      {/* Stream Settings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-4">
        <h3 className="font-display text-lg font-semibold">Stream Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(settings ?? []).map((s: StreamSetting) => {
            const streamInfo = (INCOME_STREAMS ?? []).find((si: any) => si?.id === s?.stream)
            return (
              <div key={s?.stream} className="rounded-xl border border-border bg-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-display text-sm font-semibold" style={{ color: streamInfo?.color ?? '#10B981' }}>
                    {streamInfo?.label ?? s?.stream}
                  </h4>
                  <button
                    onClick={() => updateSetting(s?.stream ?? '', 'isActive', !(s?.isActive ?? true))}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                      s?.isActive ? 'bg-primary' : 'bg-secondary'
                    }`}
                  >
                    <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                      s?.isActive ? 'translate-x-[18px]' : 'translate-x-[3px]'
                    }`} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground">Automation (%)</label>
                    <input
                      type="number" min={0} max={100}
                      value={s?.automationScore ?? 0}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting(s?.stream ?? '', 'automationScore', Number(e.target.value))}
                      className="w-full rounded border border-border bg-secondary px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground">Hours/Week</label>
                    <input
                      type="number" min={0} max={40} step={0.5}
                      value={s?.hoursPerWeek ?? 0}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting(s?.stream ?? '', 'hoursPerWeek', Number(e.target.value))}
                      className="w-full rounded border border-border bg-secondary px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {['pessimistic', 'realistic', 'optimistic'].map((field: string) => (
                    <div key={field} className="space-y-1">
                      <label className="text-[10px] text-muted-foreground capitalize">{field}</label>
                      <input
                        type="number" min={0}
                        value={(s as any)?.[field] ?? 0}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSetting(s?.stream ?? '', field, Number(e.target.value))}
                        className="w-full rounded border border-border bg-secondary px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
