export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import { prisma } from '@/lib/db'
import { MONETIZATION_PROGRAMS, PROGRESS_STATUSES } from '@/lib/distribution'

async function list() {
  const rows = await prisma.platformProgress.findMany()
  const byId = new Map(rows.map((r) => [r.platform, r]))
  return MONETIZATION_PROGRAMS.map((p) => {
    const r = byId.get(p.platform)
    return {
      ...p,
      progress: {
        followers: r?.followers ?? 0,
        views: r?.views ?? 0,
        watchHours: r?.watchHours ?? 0,
        status: r?.status ?? 'not_started',
        notes: r?.notes ?? '',
      },
    }
  })
}

export async function GET() {
  const denied = await requireAuth()
  if (denied) return denied
  try {
    return NextResponse.json({ programs: await list() })
  } catch (e: any) {
    console.error('Monetization list error:', e)
    return NextResponse.json({ error: e?.message ?? 'Failed to load' }, { status: 500 })
  }
}

/** Body: { platform, followers?, views?, watchHours?, status?, notes? } */
export async function PATCH(request: NextRequest) {
  const denied = await requireAuth()
  if (denied) return denied
  try {
    const b = await request.json().catch(() => ({}))
    if (!MONETIZATION_PROGRAMS.some((p) => p.platform === b?.platform)) {
      return NextResponse.json({ error: 'Unknown platform' }, { status: 400 })
    }
    const num = (v: unknown) => (Number.isFinite(Number(v)) && Number(v) >= 0 ? Number(v) : undefined)
    const data = {
      followers: num(b.followers) !== undefined ? Math.round(num(b.followers)!) : undefined,
      views: num(b.views) !== undefined ? Math.round(num(b.views)!) : undefined,
      watchHours: num(b.watchHours),
      status: (PROGRESS_STATUSES as readonly string[]).includes(b.status) ? b.status : undefined,
      notes: typeof b.notes === 'string' ? b.notes.slice(0, 2000) : undefined,
    }
    await prisma.platformProgress.upsert({ where: { platform: b.platform }, update: data, create: { platform: b.platform, ...data } })
    return NextResponse.json({ programs: await list() })
  } catch (e: any) {
    console.error('Monetization update error:', e)
    return NextResponse.json({ error: e?.message ?? 'Failed to save' }, { status: 500 })
  }
}
