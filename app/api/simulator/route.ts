export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'

interface SimParams {
  stream: string
  optimistic: number
  realistic: number
  pessimistic: number
}

function runMonteCarloSimulation(params: SimParams[], months: number = 6, iterations: number = 1000) {
  const monthlyResults: Array<{ month: number; p10: number; p25: number; p50: number; p75: number; p90: number }> = []

  for (let m = 1; m <= months; m++) {
    const totals: number[] = []

    for (let i = 0; i < iterations; i++) {
      let total = 0
      for (const param of params ?? []) {
        const opt = param?.optimistic ?? 0
        const real = param?.realistic ?? 0
        const pess = param?.pessimistic ?? 0

        // PERT distribution approximation
        const mean = (opt + 4 * real + pess) / 6
        const stdDev = (opt - pess) / 6

        // Growth factor over months
        const growthFactor = 1 + (m - 1) * 0.15

        // Box-Muller transform for normal distribution
        const u1 = Math.random()
        const u2 = Math.random()
        const z = Math.sqrt(-2 * Math.log(u1 || 0.001)) * Math.cos(2 * Math.PI * u2)

        const monthlyIncome = Math.max(0, (mean + z * stdDev) * growthFactor)
        total += monthlyIncome
      }
      totals.push(total)
    }

    totals.sort((a: number, b: number) => a - b)
    const getPercentile = (p: number) => totals[Math.floor(((totals?.length ?? 1) - 1) * p / 100)] ?? 0

    monthlyResults.push({
      month: m,
      p10: Math.round(getPercentile(10)),
      p25: Math.round(getPercentile(25)),
      p50: Math.round(getPercentile(50)),
      p75: Math.round(getPercentile(75)),
      p90: Math.round(getPercentile(90)),
    })
  }

  return monthlyResults
}

export async function POST(request: NextRequest) {
  const denied = await requireAuth()
  if (denied) return denied
  try {
    const body = await request.json()
    const { params, months } = body ?? {}

    if (!params || !Array.isArray(params) || (params?.length ?? 0) === 0) {
      return NextResponse.json({ error: 'Missing simulation parameters' }, { status: 400 })
    }

    const results = runMonteCarloSimulation(params, months ?? 6)
    return NextResponse.json({ results })
  } catch (error: any) {
    console.error('Simulator error:', error)
    return NextResponse.json({ error: error?.message ?? 'Simulation failed' }, { status: 500 })
  }
}
