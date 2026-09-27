export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import { prisma } from '@/lib/db'
import { getScript, refreshStatus, serializeVideo } from '@/lib/videos'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAuth()
  if (denied) return denied
  try {
    const { id } = await params
    const body = await request.json()
    const video = await prisma.videoProject.findUnique({ where: { id } })
    if (!video) return NextResponse.json({ error: 'Video not found' }, { status: 404 })

    const data: Record<string, unknown> = {}
    if (typeof body?.youtubeTitle === 'string') data.youtubeTitle = body.youtubeTitle.slice(0, 100)
    if (typeof body?.description === 'string') data.description = body.description
    if (Array.isArray(body?.tags)) data.tags = body.tags.map(String).filter(Boolean).slice(0, 30)
    if (body?.scheduledFor !== undefined) data.scheduledFor = body.scheduledFor ? new Date(body.scheduledFor) : null
    if (Array.isArray(body?.sceneNarrations)) {
      const script = getScript(video)
      if (script) {
        const clips = Array.isArray(video.voiceover) ? [...(video.voiceover as unknown[])] : []
        script.scenes = script.scenes.map((s, i) => {
          const next = body.sceneNarrations[i]
          if (typeof next === 'string' && next !== s.narration) {
            clips[i] = null // narration changed → voiceover for that scene must be regenerated
            return { ...s, narration: next }
          }
          return s
        })
        data.script = script as any
        data.voiceover = clips as any
        data.videoUrl = null
        data.renderRequestId = null
      }
    }
    await prisma.videoProject.update({ where: { id }, data })
    const updated = await refreshStatus(id)
    return NextResponse.json(serializeVideo(updated!))
  } catch (e: any) {
    console.error('Update video error:', e)
    return NextResponse.json({ error: e?.message ?? 'Failed to update video' }, { status: 500 })
  }
}
