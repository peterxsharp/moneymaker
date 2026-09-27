export const dynamic = 'force-dynamic'
export const maxDuration = 300

import { NextRequest, NextResponse } from 'next/server'
import type { Prisma } from '@prisma/client'
import { requireAuth } from '@/lib/api-auth'
import { prisma } from '@/lib/db'
import { getPublicFileUrl } from '@/lib/s3'
import { getDistribution, serializeVideo, type DistributionPlatform } from '@/lib/videos'
import { isDailymotionConfigured, isVimeoConfigured, uploadToDailymotion, uploadToVimeo } from '@/lib/distribution'

const PLATFORMS: DistributionPlatform[] = ['vimeo', 'dailymotion', 'rumble']

/**
 * Body: { platform: 'vimeo'|'dailymotion'|'rumble', privacy?: 'public'|'unlisted'|'private', url?: string, remove?: boolean }
 * Vimeo/Dailymotion upload automatically; Rumble records a manually posted URL.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAuth()
  if (denied) return denied
  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const platform = body?.platform as DistributionPlatform
  if (!PLATFORMS.includes(platform)) return NextResponse.json({ error: 'Unknown platform' }, { status: 400 })

  const video = await prisma.videoProject.findUnique({ where: { id } })
  if (!video) return NextResponse.json({ error: 'Video not found' }, { status: 404 })
  const dist = getDistribution(video)

  const save = async (next: typeof dist, lastError: string | null = video.lastError) => {
    const updated = await prisma.videoProject.update({
      where: { id },
      data: { distribution: next as unknown as Prisma.InputJsonValue, lastError },
    })
    return NextResponse.json(serializeVideo(updated))
  }

  if (body?.remove) {
    const next = { ...dist }
    delete next[platform]
    return save(next)
  }

  if (platform === 'rumble') {
    const url = String(body?.url ?? '').trim()
    if (!/^https:\/\/(www\.)?rumble\.com\//i.test(url)) {
      return NextResponse.json({ error: 'Paste the full rumble.com link to the posted video' }, { status: 400 })
    }
    return save({ ...dist, rumble: { url, postedAt: new Date().toISOString(), manual: true } })
  }

  if (!video.videoUrl) return NextResponse.json({ error: 'Render the video first' }, { status: 400 })
  if (dist[platform]) return NextResponse.json({ error: `Already posted to ${platform}` }, { status: 400 })
  const configured = platform === 'vimeo' ? isVimeoConfigured() : isDailymotionConfigured()
  if (!configured) return NextResponse.json({ error: `${platform === 'vimeo' ? 'Vimeo' : 'Dailymotion'} credentials are not configured yet` }, { status: 400 })

  try {
    const privacy = ['public', 'unlisted', 'private'].includes(body?.privacy) ? body.privacy : 'public'
    const input = {
      title: video.youtubeTitle || video.topic,
      description: video.description,
      tags: video.tags,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailPath ? getPublicFileUrl(video.thumbnailPath) : undefined,
      privacy,
    }
    const result = platform === 'vimeo' ? await uploadToVimeo(input) : await uploadToDailymotion(input)
    return save(
      { ...dist, [platform]: { url: result.url, externalId: result.externalId, postedAt: new Date().toISOString() } },
      result.warning ?? null,
    )
  } catch (e: any) {
    console.error(`Distribute to ${platform} error:`, e)
    const message = e?.message ?? `Posting to ${platform} failed`
    await prisma.videoProject.update({ where: { id }, data: { lastError: message } }).catch(() => null)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
