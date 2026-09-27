'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface ChartItem {
  name: string
  value: number
  fill: string
}

export default function BudgetPieInner({ data, total }: { data: ChartItem[]; total: number }) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data ?? []}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {(data ?? []).map((entry: ChartItem, index: number) => (
              <Cell key={`cell-${index}`} fill={entry?.fill ?? '#10B981'} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: 'hsl(160 10% 9%)', border: '1px solid hsl(160 8% 18%)', borderRadius: '8px', fontSize: 11 }}
            formatter={(value: any) => [`$${value}`, '']}
          />
          <Legend
            verticalAlign="top"
            wrapperStyle={{ fontSize: 11 }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
