'use client'

import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { INCOME_STREAMS } from '@/lib/streams'

export default function TimelineChartInner({ data }: { data: Record<string, any>[] }) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data ?? []} margin={{ top: 5, right: 10, left: 10, bottom: 20 }}>
          <XAxis
            dataKey="month"
            tickLine={false}
            tick={{ fontSize: 10, fill: 'hsl(150 10% 55%)' }}
            axisLine={false}
          />
          <YAxis
            tickLine={false}
            tick={{ fontSize: 10, fill: 'hsl(150 10% 55%)' }}
            axisLine={false}
            tickFormatter={(v: number) => `$${v}`}
          />
          <Tooltip
            contentStyle={{ backgroundColor: 'hsl(160 10% 9%)', border: '1px solid hsl(160 8% 18%)', borderRadius: '8px', fontSize: 11 }}
            formatter={(value: any) => [`$${value}`, '']}
          />
          <Legend verticalAlign="top" wrapperStyle={{ fontSize: 11 }} />
          {(INCOME_STREAMS ?? []).map((stream: any) => (
            <Area
              key={stream?.id}
              type="monotone"
              dataKey={stream?.label ?? stream?.id}
              stackId="1"
              stroke={stream?.color ?? '#10B981'}
              fill={stream?.color ?? '#10B981'}
              fillOpacity={0.3}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
