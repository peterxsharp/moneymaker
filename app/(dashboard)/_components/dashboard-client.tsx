'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, TrendingUp, Clock, Zap, Video, Link2, Shirt, BarChart3 } from 'lucide-react'
import { StatCard } from './stat-card'
import { BudgetPieChart } from './budget-pie-chart'
import { IncomeTimelineChart } from './income-timeline-chart'
import { INCOME_STREAMS, TOTAL_SEED } from '@/lib/streams'

interface BudgetAlloc {
  id: string
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

const defaultSettings: StreamSetting[] = [
  { stream: 'youtube', automationScore: 85, hoursPerWeek: 5, isActive: true, optimistic: 500, realistic: 200, pessimistic: 50 },
  { stream: 'tiktok', automationScore: 90, hoursPerWeek: 3, isActive: true, optimistic: 300, realistic: 100, pessimistic: 20 },
  { stream: 'affiliate', automationScore: 70, hoursPerWeek: 8, isActive: true, optimistic: 800, realistic: 300, pessimistic: 50 },
  { stream: 'arbitrage', automationScore: 60, hoursPerWeek: 4, isActive: true, optimistic: 400, realistic: 150, pessimistic: 0 },
  { stream: 'pod', automationScore: 75, hoursPerWeek: 4, isActive: true, optimistic: 350, realistic: 120, pessimistic: 20 },
]

const streamIcons: Record<string, any> = {
  youtube: Video,
  tiktok: Video,
  affiliate: Link2,
  arbitrage: TrendingUp,
  pod: Shirt,
}

export function DashboardClient() {
  const [budget, setBudget] = useState<BudgetAlloc[]>([])
  const [settings, setSettings] = useState<StreamSetting[]>(defaultSettings)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [budgetRes, settingsRes] = await Promise.all([
        fetch('/api/budget'),
        fetch('/api/stream-settings'),
      ])
      const budgetData = await budgetRes.json().catch(() => [])
      const settingsData = await settingsRes.json().catch(() => [])

      if (Array.isArray(budgetData) && (budgetData?.length ?? 0) > 0) setBudget(budgetData)
      if (Array.isArray(settingsData) && (settingsData?.length ?? 0) > 0) setSettings(settingsData)
    } catch (err: any) {
      console.error('Dashboard fetch error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const totalBudgetUsed = (budget ?? []).reduce((sum: number, b: BudgetAlloc) => sum + (b?.amount ?? 0), 0)
  const totalProjectedMonthly = (settings ?? []).reduce((sum: number, s: StreamSetting) => sum + (s?.realistic ?? 0), 0)
  const avgAutomation = (settings?.length ?? 0) > 0
    ? Math.round((settings ?? []).reduce((sum: number, s: StreamSetting) => sum + (s?.automationScore ?? 0), 0) / (settings?.length ?? 1))
    : 0
  const totalHoursPerWeek = (settings ?? []).reduce((sum: number, s: StreamSetting) => sum + (s?.hoursPerWeek ?? 0), 0)

  // Generate 12-month projections
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const projectionData = monthLabels.map((month: string, i: number) => {
    const growthFactor = 1 + i * 0.18
    const entry: Record<string, any> = { month }
    for (const s of (settings ?? [])) {
      const streamInfo = (INCOME_STREAMS ?? []).find((is: any) => is?.id === s?.stream)
      entry[streamInfo?.label ?? s?.stream ?? 'unknown'] = Math.round((s?.realistic ?? 0) * growthFactor)
    }
    entry['Total'] = Object.keys(entry ?? {}).filter((k: string) => k !== 'month').reduce((sum: number, k: string) => sum + ((entry?.[k] as number) ?? 0), 0)
    return entry
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <h1 className="font-display text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Your passive income portfolio at a glance</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Seed Budget"
          value={`$${TOTAL_SEED}`}
          subtitle={`$${totalBudgetUsed} allocated`}
          icon={DollarSign}
          delay={0}
        />
        <StatCard
          title="Projected Monthly"
          value={`$${totalProjectedMonthly}`}
          subtitle="Realistic estimate"
          icon={TrendingUp}
          trend={18}
          color="#10B981"
          delay={0.1}
        />
        <StatCard
          title="Automation Score"
          value={`${avgAutomation}%`}
          subtitle="Avg across all streams"
          icon={Zap}
          delay={0.2}
        />
        <StatCard
          title="Time per Week"
          value={`${totalHoursPerWeek}h`}
          subtitle="Total time investment"
          icon={Clock}
          delay={0.3}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget Allocation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-card p-6 lg:col-span-1"
        >
          <h3 className="font-display text-lg font-semibold mb-4">Budget Allocation</h3>
          <BudgetPieChart data={budget} total={TOTAL_SEED} />
        </motion.div>

        {/* Income Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-border bg-card p-6 lg:col-span-2"
        >
          <h3 className="font-display text-lg font-semibold mb-4">12-Month Income Projection</h3>
          <IncomeTimelineChart data={projectionData} />
        </motion.div>
      </div>

      {/* Stream Cards */}
      <div>
        <h3 className="font-display text-lg font-semibold mb-4">Income Streams</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {(INCOME_STREAMS ?? []).map((stream: any, i: number) => {
            const setting = (settings ?? []).find((s: StreamSetting) => s?.stream === stream?.id) ?? defaultSettings?.[i]
            const Icon = streamIcons?.[stream?.id ?? ''] ?? BarChart3
            return (
              <motion.div
                key={stream?.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * i }}
                className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-all group"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stream?.color ?? '#10B981'}20` }}>
                    <Icon className="h-5 w-5" style={{ color: stream?.color ?? '#10B981' }} />
                  </div>
                  <div>
                    <h4 className="font-display text-sm font-semibold">{stream?.label}</h4>
                    <div className="flex items-center gap-2">
                      <span className={`inline-block h-2 w-2 rounded-full ${setting?.isActive ? 'bg-emerald-400' : 'bg-gray-500'}`} />
                      <span className="text-xs text-muted-foreground">{setting?.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Monthly (Realistic)</p>
                    <p className="font-mono text-lg font-bold" style={{ color: stream?.color ?? '#10B981' }}>
                      ${setting?.realistic ?? 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Automation</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-secondary">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{ width: `${setting?.automationScore ?? 0}%`, backgroundColor: stream?.color ?? '#10B981' }}
                        />
                      </div>
                      <span className="font-mono text-xs">{setting?.automationScore ?? 0}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Hours/Week</p>
                    <p className="font-mono text-sm font-medium">{setting?.hoursPerWeek ?? 0}h</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Budget</p>
                    <p className="font-mono text-sm font-medium">
                      ${(budget ?? []).find((b: BudgetAlloc) => b?.stream === stream?.id)?.amount ?? 0}
                    </p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
