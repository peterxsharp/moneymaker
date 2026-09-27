export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/api-auth'

export async function GET() {
  const denied = await requireAuth()
  if (denied) return denied
  try {
    const items = await prisma.contentCalendarItem.findMany({
      orderBy: { day: 'asc' },
    })
    return NextResponse.json(items ?? [])
  } catch (error: any) {
    console.error('Calendar GET error:', error)
    return NextResponse.json({ error: error?.message ?? 'Failed to fetch calendar' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const denied = await requireAuth()
  if (denied) return denied
  try {
    const body = await request.json()
    const items = body?.items ?? []
    // Clear existing and recreate
    await prisma.contentCalendarItem.deleteMany()
    const created = []
    for (const item of items) {
      const entry = await prisma.contentCalendarItem.create({
        data: {
          day: item?.day ?? 1,
          date: new Date(item?.date ?? Date.now()),
          platform: item?.platform ?? 'YouTube',
          niche: item?.niche ?? 'Finance',
          title: item?.title ?? '',
          description: item?.description ?? '',
          status: item?.status ?? 'pending',
        },
      })
      created.push(entry)
    }
    return NextResponse.json(created)
  } catch (error: any) {
    console.error('Calendar POST error:', error)
    return NextResponse.json({ error: error?.message ?? 'Failed to save calendar' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const denied = await requireAuth()
  if (denied) return denied
  try {
    const body = await request.json()
    const { id, status } = body ?? {}
    const updated = await prisma.contentCalendarItem.update({
      where: { id: id ?? '' },
      data: { status: status ?? 'pending' },
    })
    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Calendar PATCH error:', error)
    return NextResponse.json({ error: error?.message ?? 'Failed to update item' }, { status: 500 })
  }
}
