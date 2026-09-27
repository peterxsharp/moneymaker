export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const denied = await requireAuth()
  if (denied) return denied
  try {
    const settings = await prisma.streamSettings.findMany()
    return NextResponse.json(settings ?? [])
  } catch (error: any) {
    console.error('StreamSettings GET error:', error)
    return NextResponse.json({ error: error?.message ?? 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  const denied = await requireAuth()
  if (denied) return denied
  try {
    const body = await request.json()
    const { stream, automationScore, hoursPerWeek, isActive, optimistic, realistic, pessimistic } = body ?? {}
    const settings = await prisma.streamSettings.upsert({
      where: { stream: stream ?? '' },
      update: {
        automationScore: automationScore ?? 0,
        hoursPerWeek: hoursPerWeek ?? 0,
        isActive: isActive ?? true,
        optimistic: optimistic ?? 0,
        realistic: realistic ?? 0,
        pessimistic: pessimistic ?? 0,
      },
      create: {
        stream: stream ?? '',
        automationScore: automationScore ?? 0,
        hoursPerWeek: hoursPerWeek ?? 0,
        isActive: isActive ?? true,
        optimistic: optimistic ?? 0,
        realistic: realistic ?? 0,
        pessimistic: pessimistic ?? 0,
      },
    })
    return NextResponse.json(settings)
  } catch (error: any) {
    console.error('StreamSettings PUT error:', error)
    return NextResponse.json({ error: error?.message ?? 'Failed to update settings' }, { status: 500 })
  }
}
