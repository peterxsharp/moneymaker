export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import { prisma } from '@/lib/db'
import { ensureLaunchVideos, serializeVideo } from '@/lib/videos'
import { isTtsConfigured } from '@/lib/media-ai'
import { isYouTubeConfigured } from '@/lib/youtube'
import { YOUTUBE_CHANNEL_URL } from '@/lib/video-launch-plan'
import { isDailymotionConfigured, isVimeoConfigured } from '@/lib/distribution'

export async function GET() {
  const denied = await requireAuth()
  if (denied) return denied
  try {
    await ensureLaunchVideos()
    const [videos, conn] = await Promise.all([
      prisma.videoProject.findMany({ orderBy: { order: 'asc' } }),
      prisma.youTubeConnection.findUnique({ where: { id: 'default' } }),
    ])
    return NextResponse.json({
      videos: videos.map(serializeVideo),
      integrations: {
        tts: isTtsConfigured(),
        youtubeConfigured: isYouTubeConfigured(),
        youtubeConnected: Boolean(conn),
        channelTitle: conn?.channelTitle ?? '',
        channelUrl: YOUTUBE_CHANNEL_URL,
        vimeo: isVimeoConfigured(),
        dailymotion: isDailymotionConfigured(),
      },
    })
  } catch (e: any) {
    console.error('List videos error:', e)
    return NextResponse.json({ error: e?.message ?? 'Failed to load videos' }, { status: 500 })
  }
}
