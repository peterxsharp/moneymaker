'use client'

import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'
import { motion } from 'framer-motion'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: number
  color?: string
  delay?: number
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, color, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-all"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="mt-2 font-display text-2xl font-bold tracking-tight" style={{ color: color ?? undefined }}>
            {value}
          </p>
          {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
      {trend !== undefined && trend !== null && (
        <div className="mt-3 flex items-center gap-1">
          <span className={cn('text-xs font-medium', (trend ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400')}>
            {(trend ?? 0) >= 0 ? '+' : ''}{trend?.toFixed?.(1) ?? '0'}%
          </span>
          <span className="text-xs text-muted-foreground">vs last month</span>
        </div>
      )}
    </motion.div>
  )
}
