'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { BarChart3, Play, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { INCOME_STREAMS } from '@/lib/streams'
import dynamic from 'next/dynamic'

const SimulatorChart = dynamic(() => import('./simulator-chart'), { ssr: false, loading: () => <div className="h-[400px] flex items-center justify-center text-muted-foreground text-sm">Loading chart...</div> })

interface StreamParam {
  stream: string
  label: string
  optimistic: number
  realistic: number
  pessimistic: number
}

const defaultParams: StreamParam[] = [
  { stream: 'youtube', label: 'Faceless YouTube', optimistic: 500, realistic: 200, pessimistic: 50 },
  { stream: 'tiktok', label: 'TikTok/Shorts', optimistic: 300, realistic: 100, pessimistic: 20 },
  { stream: 'affiliate', label: 'Affiliate Marketing', optimistic: 800, realistic: 300, pessimistic: 50 },
  { stream: 'arbitrage', label: 'Crypto Arbitrage', optimistic: 400, realistic: 150, pessimistic: 0 },
  { stream: 'pod', label: 'Print-on-Demand', optimistic: 350, realistic: 120, pessimistic: 20 },
]

export function SimulatorClient() {
  const [params, setParams] = useState<StreamParam[]>(defaultParams)
  const [months, setMonths] = useState(6)
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const updateParam = useCallback((index: number, field: string, value: number) => {
    setParams((prev: StreamParam[]) => {
      const copy = [...(prev ?? [])]
      if (copy?.[index]) {
        copy[index] = { ...(copy[index] ?? {}), [field]: value } as StreamParam
      }
      return copy
    })
  }, [])

  const runSimulation = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/simulator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ params, months }),
      })
      const data = await res.json()
      setResults(data?.results ?? [])
    } catch (err: any) {
      console.error('Simulation error:', err)
    } finally {
      setLoading(false)
    }
  }, [params, months])

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <h1 className="font-display text-3xl font-bold tracking-tight flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-primary" />
          Income Simulator
        </h1>
        <p className="text-muted-foreground">Monte Carlo projection of your combined income streams</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Parameters */}
        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
          <h3 className="font-display text-lg font-semibold">Stream Parameters</h3>
          <p className="text-xs text-muted-foreground">Set monthly income estimates ($/month) for each stream</p>

          <div className="space-y-5">
            {(params ?? []).map((p: StreamParam, i: number) => {
              const streamInfo = (INCOME_STREAMS ?? []).find((s: any) => s?.id === p?.stream)
              return (
                <div key={p?.stream} className="space-y-2">
                  <p className="text-sm font-medium" style={{ color: streamInfo?.color ?? '#10B981' }}>{p?.label}</p>
                  <div className="grid grid-cols-3 gap-2">
                    {['pessimistic', 'realistic', 'optimistic'].map((field: string) => (
                      <div key={field}>
                        <label className="text-[10px] text-muted-foreground capitalize">{field}</label>
                        <input
                          type="number"
                          value={(p as any)?.[field] ?? 0}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateParam(i, field, Number(e.target.value))}
                          className="w-full rounded border border-border bg-secondary px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium text-muted-foreground">Months</label>
              <span className="text-sm font-mono text-primary">{months}</span>
            </div>
            <input
              type="range" min={3} max={12} value={months}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMonths(Number(e.target.value))}
              className="w-full accent-primary"
            />
          </div>

          <Button onClick={runSimulation} disabled={loading} className="w-full gap-2" size="lg">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Run Simulation
          </Button>
        </div>

        {/* Chart */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6">
          <h3 className="font-display text-lg font-semibold mb-4">Portfolio Income Curve</h3>
          {(results?.length ?? 0) > 0 ? (
            <SimulatorChart data={results} />
          ) : (
            <div className="h-[400px] flex items-center justify-center border border-dashed border-border rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">Set your parameters and run the simulation</p>
                <p className="text-xs text-muted-foreground mt-1">1,000 Monte Carlo iterations with PERT distribution</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
