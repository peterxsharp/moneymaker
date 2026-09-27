import type { VideoProject } from '@prisma/client'
import { prisma } from './db'
import { getPublicFileUrl } from './s3'
import { LAUNCH_VIDEOS, LAUNCH_DATE_ISO, type VideoScript } from './video-launch-plan'

export interface VoiceClip { path: string; duration: number }

export type DistributionPlatform = 'vimeo' | 'dailymotion' | 'rumble'
export interface DistributionEntry { url: string; externalId?: string; postedAt: string; manual?: boolean }
export type DistributionMap = Partial<Record<DistributionPlatform, DistributionEntry>>

export function getDistribution(v: VideoProject): DistributionMap {
  return v.distribution && typeof v.distribution === 'object' && !Array.isArray(v.distribution)
    ? (v.distribution as unknown as DistributionMap)
    : {}
}

/** Creates the launch slate on first use (never overwrites existing rows). */
export async function ensureLaunchVideos() {
  const count = await prisma.videoProject.count()
  if (count >= LAUNCH_VIDEOS.length) return
  await prisma.videoProject.createMany({
    data: LAUNCH_VIDEOS.map((v) => ({ ...v, scheduledFor: new Date(LAUNCH_DATE_ISO) })),
    skipDuplicates: true,
  })
}

export function getScript(v: VideoProject): VideoScript | null {
  return (v.script as unknown as VideoScript) ?? null
}
export function getSceneImages(v: VideoProject): (string | null)[] {
  return Array.isArray(v.sceneImages) ? (v.sceneImages as (string | null)[]) : []
}
export function getVoiceClips(v: VideoProject): (VoiceClip | null)[] {
  return Array.isArray(v.voiceover) ? (v.voiceover as unknown as (VoiceClip | null)[]) : []
}

/** Derives the pipeline stage from what assets exist. */
export function computeStatus(v: VideoProject): string {
  if (v.youtubeVideoId) return 'published'
  if (v.videoUrl) return 'rendered'
  const script = getScript(v)
  if (!script) return 'planned'
  const n = script.scenes?.length ?? 0
  const imgs = getSceneImages(v)
  const clips = getVoiceClips(v)
  const hasVisuals = n > 0 && !!v.thumbnailPath && Array.from({ length: n }).every((_, i) => !!imgs[i])
  const hasVoice = n > 0 && Array.from({ length: n }).every((_, i) => !!clips[i])
  if (hasVisuals && hasVoice) return 'voiced'
  if (hasVisuals) return 'visuals'
  return 'scripted'
}

export async function refreshStatus(id: string) {
  const v = await prisma.videoProject.findUnique({ where: { id } })
  if (!v) return null
  const status = computeStatus(v)
  return status === v.status ? v : prisma.videoProject.update({ where: { id }, data: { status } })
}

export function serializeVideo(v: VideoProject) {
  const script = getScript(v)
  return {
    id: v.id,
    slug: v.slug,
    order: v.order,
    topic: v.topic,
    angle: v.angle,
    factSheet: v.factSheet,
    sources: v.sources,
    status: v.status,
    script,
    youtubeTitle: v.youtubeTitle,
    description: v.description,
    tags: v.tags,
    thumbnailUrl: v.thumbnailPath ? getPublicFileUrl(v.thumbnailPath) : null,
    sceneImageUrls: getSceneImages(v).map((p) => (p ? getPublicFileUrl(p) : null)),
    voiceClips: getVoiceClips(v).map((c) => (c ? { url: getPublicFileUrl(c.path), duration: c.duration } : null)),
    rendering: Boolean(v.renderRequestId && !v.videoUrl),
    videoUrl: v.videoUrl,
    youtubeVideoId: v.youtubeVideoId,
    scheduledFor: v.scheduledFor?.toISOString() ?? null,
    publishedAt: v.publishedAt?.toISOString() ?? null,
    lastError: v.lastError,
    distribution: getDistribution(v),
  }
}

export type SerializedVideo = ReturnType<typeof serializeVideo>
