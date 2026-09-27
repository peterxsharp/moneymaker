export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DEFAULT_BUDGET } from '@/lib/streams'
import { requireAuth } from '@/lib/api-auth'

export async function GET() {
  const denied = await requireAuth()
  if (denied) return denied
  try {
    let allocations = await prisma.budgetAllocation.findMany()
    if ((allocations?.length ?? 0) === 0) {
      const entries = Object.entries(DEFAULT_BUDGET ?? {})
      for (const [stream, data] of entries) {
        await prisma.budgetAllocation.create({
          data: { stream, amount: data?.amount ?? 0, label: data?.label ?? stream, color: data?.color ?? '#10B981' },
        })
      }
      allocations = await prisma.budgetAllocation.findMany()
    }
    return NextResponse.json(allocations ?? [])
  } catch (error: any) {
    console.error('Budget GET error:', error)
    return NextResponse.json({ error: error?.message ?? 'Failed to fetch budget' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const denied = await requireAuth()
  if (denied) return denied
  try {
    const body = await request.json()
    const allocations = body?.allocations ?? []
    const results = []
    for (const alloc of allocations) {
      const result = await prisma.budgetAllocation.upsert({
        where: { stream: alloc?.stream ?? '' },
        update: { amount: alloc?.amount ?? 0 },
        create: {
          stream: alloc?.stream ?? '',
          amount: alloc?.amount ?? 0,
          label: alloc?.label ?? alloc?.stream ?? '',
          color: alloc?.color ?? '#10B981',
        },
      })
      results.push(result)
    }
    return NextResponse.json(results)
  } catch (error: any) {
    console.error('Budget PUT error:', error)
    return NextResponse.json({ error: error?.message ?? 'Failed to update budget' }, { status: 500 })
  }
}
