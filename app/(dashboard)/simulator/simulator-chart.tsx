'use client'

import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts'

export default function SimulatorChart({ data }: { data: any[] }) {
  const chartData = (data ?? []).map((d: any) => ({
    month: `Month ${d?.month ?? 0}`,
    'P90 (Best)': d?.p90 ?? 0,
    'P75': d?.p75 ?? 0,
    'P50 (Median)': d?.p50 ?? 0,
    'P25': d?.p25 ?? 0,
    'P10 (Worst)': d?.p10 ?? 0,
  }))

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 20 }}>
          <XAxis dataKey="month" tickLine={false} tick={{ fontSize: 10, fill: 'hsl(150 10% 55%)' }} axisLine={false} />
          <YAxis tickLine={false} tick={{ fontSize: 10, fill: 'hsl(150 10% 55%)' }} axisLine={false} tickFormatter={(v: number) => `$${v}`} />
          <Tooltip
            contentStyle={{ backgroundColor: 'hsl(160 10% 9%)', border: '1px solid hsl(160 8% 18%)', borderRadius: '8px', fontSize: 11 }}
            formatter={(value: any) => [`$${value}`, '']}
          />
          <Legend verticalAlign="top" wrapperStyle={{ fontSize: 11 }} />
          <Area type="monotone" dataKey="P90 (Best)" stroke="#10B981" fill="#10B981" fillOpacity={0.1} strokeWidth={1} />
          <Area type="monotone" dataKey="P75" stroke="#34D399" fill="#34D399" fillOpacity={0.1} strokeWidth={1} />
          <Area type="monotone" dataKey="P50 (Median)" stroke="#F59E0B" fill="#F59E0B" fillOpacity={0.2} strokeWidth={2} />
          <Area type="monotone" dataKey="P25" stroke="#FB923C" fill="#FB923C" fillOpacity={0.1} strokeWidth={1} />
          <Area type="monotone" dataKey="P10 (Worst)" stroke="#EF4444" fill="#EF4444" fillOpacity={0.1} strokeWidth={1} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
