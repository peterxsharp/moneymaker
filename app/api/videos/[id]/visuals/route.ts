export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import { prisma } from '@/lib/db'
import { generateImage } from '@/lib/media-ai'
import { uploadPublicBuffer } from '@/lib/s3'
import { getSceneImages, getScript, refreshStatus, serializeVideo } from '@/lib/videos'

const STYLE = 'Cinematic photorealistic tech editorial photo, 16:9, dramatic dark studio lighting with emerald green accent light, shallow depth of field, crisp detail. Absolutely no text, letters, logos, watermarks or human faces.'

/** Body: { target: 'thumbnail' } or { target: <sceneIndex:number> } — generates one image per call. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAuth()
  if (denied) return denied
  const { id } = await params
  try {
    const { target } = await request.json()
    const video = await prisma.videoProject.findUnique({ where: { id } })
    if (!video) return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    const script = getScript(video)
    if (!script) return NextResponse.json({ error: 'Generate the script first' }, { status: 400 })

    if (target === 'thumbnail') {
      const prompt = `YouTube thumbnail background for a tech video titled "${script.youtubeTitle}". ${script.thumbnailPrompt}. Bold, high-contrast, single clear focal subject on one side leaving empty space for a headline. ${STYLE}`
      const img = await generateImage(prompt)
      const path = await uploadPublicBuffer(`${video.slug}/thumbnail-${Date.now()}.png`, img, 'image/png')
      await prisma.videoProject.update({ where: { id }, data: { thumbnailPath: path, lastError: null } })
    } else {
      const idx = Number(target)
      const scene = script.scenes?.[idx]
      if (!Number.isInteger(idx) || !scene) return NextResponse.json({ error: 'Invalid scene' }, { status: 400 })
      const img = await generateImage(`${scene.visualPrompt}. ${STYLE}`)
      const path = await uploadPublicBuffer(`${video.slug}/scene-${idx}-${Date.now()}.png`, img, 'image/png')
      const fresh = await prisma.videoProject.findUnique({ where: { id } })
      const images = getSceneImages(fresh!)
      images[idx] = path
      await prisma.videoProject.update({ where: { id }, data: { sceneImages: images, videoUrl: null, renderRequestId: null, lastError: null } })
    }
    const updated = await refreshStatus(id)
    return NextResponse.json(serializeVideo(updated!))
  } catch (e: any) {
    console.error('Visuals error:', e)
    await prisma.videoProject.update({ where: { id }, data: { lastError: `Visuals: ${e?.message ?? 'failed'}` } }).catch(() => null)
    return NextResponse.json({ error: e?.message ?? 'Image generation failed' }, { status: 500 })
  }
}
