export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import { prisma } from '@/lib/db'
import { createFfmpegJob, getFfmpegJob } from '@/lib/media-ai'
import { getPublicFileUrl } from '@/lib/s3'
import { getSceneImages, getScript, getVoiceClips, refreshStatus, serializeVideo } from '@/lib/videos'

const GAP = 0.4 // seconds of breathing room after each scene

function stamp(sec: number) {
  const s = Math.floor(sec)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/** Starts the FFmpeg render: one still per scene, timed exactly to that scene's narration. */
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAuth()
  if (denied) return denied
  const { id } = await params
  try {
    const video = await prisma.videoProject.findUnique({ where: { id } })
    if (!video) return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    const script = getScript(video)
    const n = script?.scenes?.length ?? 0
    const images = getSceneImages(video)
    const clips = getVoiceClips(video)
    if (!script || n === 0) return NextResponse.json({ error: 'Generate the script first' }, { status: 400 })
    for (let i = 0; i < n; i++) {
      if (!images[i]) return NextResponse.json({ error: `Scene ${i + 1} is missing its image` }, { status: 400 })
      if (!clips[i]) return NextResponse.json({ error: `Scene ${i + 1} is missing its voiceover` }, { status: 400 })
    }

    const input_files: Record<string, string> = {}
    const inputArgs: string[] = []
    const filters: string[] = []
    const durations = clips.slice(0, n).map((c) => Number((c!.duration + GAP).toFixed(2)))
    for (let i = 0; i < n; i++) {
      input_files[`in_${i + 1}`] = getPublicFileUrl(images[i]!)
      inputArgs.push(`-loop 1 -framerate 30 -t ${durations[i]} -i {{in_${i + 1}}}`)
      filters.push(`[${i}:v]scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080,setsar=1,format=yuv420p[v${i}]`)
    }
    for (let i = 0; i < n; i++) {
      input_files[`in_${n + i + 1}`] = getPublicFileUrl(clips[i]!.path)
      inputArgs.push(`-i {{in_${n + i + 1}}}`)
      filters.push(`[${n + i}:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,apad=whole_dur=${durations[i]}[a${i}]`)
    }
    const pairs = Array.from({ length: n }, (_, i) => `[v${i}][a${i}]`).join('')
    filters.push(`${pairs}concat=n=${n}:v=1:a=1[v][a]`)
    const command = `${inputArgs.join(' ')} -filter_complex "${filters.join(';')}" -map "[v]" -map "[a]" -c:v libx264 -preset veryfast -crf 22 -r 30 -c:a aac -b:a 192k -movflags +faststart {{out_1}}`

    const requestId = await createFfmpegJob(input_files, { out_1: `${video.slug}.mp4` }, command)

    // Auto-build YouTube chapters from the exact scene timings.
    let t = 0
    const chapters = script.scenes.map((s, i) => { const line = `${stamp(t)} ${s.heading}`; t += durations[i]; return line }).join('\n')
    const baseDescription = video.description.split('\n\nChapters:\n')[0]
    await prisma.videoProject.update({
      where: { id },
      data: { renderRequestId: requestId, videoUrl: null, lastError: null, description: `${baseDescription}\n\nChapters:\n${chapters}` },
    })
    const updated = await refreshStatus(id)
    return NextResponse.json(serializeVideo(updated!))
  } catch (e: any) {
    console.error('Render start error:', e)
    await prisma.videoProject.update({ where: { id }, data: { lastError: `Render: ${e?.message ?? 'failed'}` } }).catch(() => null)
    return NextResponse.json({ error: e?.message ?? 'Failed to start render' }, { status: 500 })
  }
}

/** Polls the render job once and stores the finished video URL. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAuth()
  if (denied) return denied
  const { id } = await params
  try {
    const video = await prisma.videoProject.findUnique({ where: { id } })
    if (!video) return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    if (video.renderRequestId && !video.videoUrl) {
      const job = await getFfmpegJob(video.renderRequestId)
      if (job.status === 'SUCCESS' && job.outputs?.out_1) {
        await prisma.videoProject.update({ where: { id }, data: { videoUrl: job.outputs.out_1 } })
      } else if (job.status === 'FAILED') {
        await prisma.videoProject.update({ where: { id }, data: { renderRequestId: null, lastError: `Render: ${job.error}` } })
      }
    }
    const updated = await refreshStatus(id)
    return NextResponse.json(serializeVideo(updated!))
  } catch (e: any) {
    console.error('Render status error:', e)
    return NextResponse.json({ error: e?.message ?? 'Failed to check render' }, { status: 500 })
  }
}
