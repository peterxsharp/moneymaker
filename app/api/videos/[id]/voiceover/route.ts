export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import { prisma } from '@/lib/db'
import { synthesizeSpeech } from '@/lib/media-ai'
import { uploadPublicBuffer } from '@/lib/s3'
import { getScript, getVoiceClips, refreshStatus, serializeVideo } from '@/lib/videos'

/** Body: { sceneIndex: number } — synthesizes narration for one scene. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAuth()
  if (denied) return denied
  const { id } = await params
  try {
    const { sceneIndex } = await request.json()
    const video = await prisma.videoProject.findUnique({ where: { id } })
    if (!video) return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    const scene = getScript(video)?.scenes?.[Number(sceneIndex)]
    if (!scene) return NextResponse.json({ error: 'Invalid scene' }, { status: 400 })

    const { audio, duration } = await synthesizeSpeech(scene.narration)
    const path = await uploadPublicBuffer(`${video.slug}/voice-${sceneIndex}-${Date.now()}.wav`, audio, 'audio/wav')
    const fresh = await prisma.videoProject.findUnique({ where: { id } })
    const clips = getVoiceClips(fresh!)
    clips[Number(sceneIndex)] = { path, duration: Math.round(duration * 100) / 100 }
    await prisma.videoProject.update({ where: { id }, data: { voiceover: clips as any, videoUrl: null, renderRequestId: null, lastError: null } })
    const updated = await refreshStatus(id)
    return NextResponse.json(serializeVideo(updated!))
  } catch (e: any) {
    console.error('Voiceover error:', e)
    await prisma.videoProject.update({ where: { id }, data: { lastError: `Voiceover: ${e?.message ?? 'failed'}` } }).catch(() => null)
    return NextResponse.json({ error: e?.message ?? 'Voiceover failed' }, { status: 500 })
  }
}
