export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/api-auth'

export async function GET() {
  const denied = await requireAuth()
  if (denied) return denied
  try {
    const entries = await prisma.incomeEntry.findMany({
      orderBy: [{ year: 'asc' }, { month: 'asc' }],
    })
    return NextResponse.json(entries ?? [])
  } catch (error: any) {
    console.error('Income GET error:', error)
    return NextResponse.json({ error: error?.message ?? 'Failed to fetch income' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const denied = await requireAuth()
  if (denied) return denied
  try {
    const body = await request.json()
    const { stream, month, year, projected, actual } = body ?? {}
    const entry = await prisma.incomeEntry.upsert({
      where: { stream_month_year: { stream: stream ?? '', month: month ?? 1, year: year ?? 2024 } },
      update: { projected: projected ?? 0, actual: actual ?? 0 },
      create: { stream: stream ?? '', month: month ?? 1, year: year ?? 2024, projected: projected ?? 0, actual: actual ?? 0 },
    })
    return NextResponse.json(entry)
  } catch (error: any) {
    console.error('Income PUT error:', error)
    return NextResponse.json({ error: error?.message ?? 'Failed to update income' }, { status: 500 })
  }
}
