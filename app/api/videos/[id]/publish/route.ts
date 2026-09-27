export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import { prisma } from '@/lib/db'
import { getPublicFileUrl } from '@/lib/s3'
import { refreshStatus, serializeVideo } from '@/lib/videos'
import { uploadToYouTube } from '@/lib/youtube'

/** Body: { privacyStatus: 'private'|'unlisted'|'public', useSchedule: boolean } */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAuth()
  if (denied) return denied
  const { id } = await params
  try {
    const body = await request.json().catch(() => ({}))
    const video = await prisma.videoProject.findUnique({ where: { id } })
    if (!video) return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    if (!video.videoUrl) return NextResponse.json({ error: 'Render the video first' }, { status: 400 })
    if (video.youtubeVideoId) return NextResponse.json({ error: 'Already published' }, { status: 400 })

    const privacy = ['private', 'unlisted', 'public'].includes(body?.privacyStatus) ? body.privacyStatus : 'private'
    const publishAt = body?.useSchedule && video.scheduledFor && video.scheduledFor.getTime() > Date.now() + 15 * 60_000
      ? video.scheduledFor.toISOString()
      : undefined

    const { videoId, thumbnailError } = await uploadToYouTube({
      title: video.youtubeTitle || video.topic,
      description: video.description,
      tags: video.tags,
      privacyStatus: privacy,
      publishAt,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailPath ? getPublicFileUrl(video.thumbnailPath) : undefined,
    })
    await prisma.videoProject.update({
      where: { id },
      data: { youtubeVideoId: videoId, publishedAt: new Date(), lastError: thumbnailError ? `Uploaded, but thumbnail failed: ${thumbnailError}` : null },
    })
    const updated = await refreshStatus(id)
    return NextResponse.json(serializeVideo(updated!))
  } catch (e: any) {
    console.error('Publish error:', e)
    await prisma.videoProject.update({ where: { id }, data: { lastError: `Publish: ${e?.message ?? 'failed'}` } }).catch(() => null)
    return NextResponse.json({ error: e?.message ?? 'Publish failed' }, { status: 500 })
  }
}
