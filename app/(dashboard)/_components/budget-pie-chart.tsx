'use client'

import dynamic from 'next/dynamic'
import { INCOME_STREAMS } from '@/lib/streams'

const PieChartInner = dynamic(() => import('./budget-pie-inner'), { ssr: false, loading: () => <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">Loading chart...</div> })

interface BudgetAlloc {
  stream: string
  amount: number
  label: string
  color: string
}

export function BudgetPieChart({ data, total }: { data: BudgetAlloc[]; total: number }) {
  const chartData = (data ?? []).filter((d: BudgetAlloc) => (d?.amount ?? 0) > 0).map((d: BudgetAlloc) => {
    const streamInfo = (INCOME_STREAMS ?? []).find((s: any) => s?.id === d?.stream)
    return {
      name: streamInfo?.label ?? d?.label ?? d?.stream ?? 'Unknown',
      value: d?.amount ?? 0,
      fill: streamInfo?.color ?? d?.color ?? '#10B981',
    }
  })

  const unallocated = total - (data ?? []).reduce((sum: number, d: BudgetAlloc) => sum + (d?.amount ?? 0), 0)
  if (unallocated > 0) {
    chartData.push({ name: 'Unallocated', value: unallocated, fill: '#374151' })
  }

  return <PieChartInner data={chartData} total={total} />
}
