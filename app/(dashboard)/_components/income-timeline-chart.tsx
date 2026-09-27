'use client'

import dynamic from 'next/dynamic'

const TimelineChartInner = dynamic(() => import('./timeline-chart-inner'), { ssr: false, loading: () => <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">Loading chart...</div> })

export function IncomeTimelineChart({ data }: { data: Record<string, any>[] }) {
  return <TimelineChartInner data={data} />
}
