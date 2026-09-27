export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/api-auth'
import { prisma } from '@/lib/db'
import { refreshStatus, serializeVideo } from '@/lib/videos'
import { CHANNEL_NAME, YOUTUBE_CHANNEL_URL, type VideoScript } from '@/lib/video-launch-plan'

const SCHEMA_EXAMPLE = `{
  "youtubeTitle": "Max 70 chars, curiosity + keyword, no clickbait lies",
  "altTitles": ["alt 1", "alt 2"],
  "hook": "The first 1-2 sentences spoken (also scenes[0] narration opening)",
  "scenes": [
    { "heading": "Chapter title", "narration": "Exact words the narrator speaks", "visualPrompt": "Description of a single illustrative image for this scene", "onScreenText": "Short overlay text, max 6 words" }
  ],
  "cta": "Closing call to action",
  "description": "SEO YouTube description, 150-250 words, first 2 lines are the hook",
  "tags": ["tag1", "tag2"],
  "thumbnailText": "2-4 punchy words",
  "thumbnailPrompt": "Description of a bold, high-contrast thumbnail image (no text in image)"
}`

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAuth()
  if (denied) return denied
  const { id } = await params
  const video = await prisma.videoProject.findUnique({ where: { id } })
  if (!video) return new Response(JSON.stringify({ error: 'Video not found' }), { status: 404 })
  const body = await request.json().catch(() => ({}))
  const notes: string = typeof body?.notes === 'string' ? body.notes.slice(0, 1000) : ''

  const system = `You are the head writer for "${CHANNEL_NAME}" (${YOUTUBE_CHANNEL_URL}), a faceless tech YouTube channel with a confident, helpful, no-hype voice.
Write a complete, ready-to-narrate script for a 6-8 minute video (1,000-1,250 spoken words total).

RULES:
- Use ONLY the facts in the FACT SHEET. Never invent specs, prices, dates, quotes or benchmarks. If something is uncertain, say so or leave it out.
- 7-9 scenes. scenes[0] is the hook (grab attention in the first 10 seconds, promise the payoff). The last scene is the wrap-up + call to action (subscribe to ${CHANNEL_NAME}, comment prompt).
- Narration is plain spoken English: no stage directions, no markdown, no emojis, no bracketed cues. Spell out symbols naturally (e.g. "dollars", "gigabytes").
- visualPrompt: one concrete, photorealistic editorial image idea per scene. Never request text, logos or real people's faces.
- Description ends with a short disclaimer line when discussing prices ("Prices change often - verify before buying.").
- 15-25 tags mixing broad and long-tail keywords.

Respond with raw JSON only, exactly this structure:
${SCHEMA_EXAMPLE}`

  const user = `VIDEO TOPIC: ${video.topic}\nANGLE: ${video.angle}\n\nFACT SHEET (verified ${new Date(video.createdAt).toISOString().slice(0, 10)}):\n${video.factSheet}${notes ? `\n\nPRODUCER NOTES: ${notes}` : ''}`

  const llm = await fetch('https://apps.abacus.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.ABACUSAI_API_KEY}` },
    body: JSON.stringify({
      model: 'gpt-5.4',
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
      response_format: { type: 'json_object' },
      temperature: 0.5,
      max_tokens: 6000,
      stream: true,
    }),
  })
  if (!llm.ok || !llm.body) {
    const err = await llm.text().catch(() => '')
    return new Response(JSON.stringify({ error: `Script generation failed at the LLM step: ${err.slice(0, 300)}` }), { status: 500 })
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`))
      const reader = llm.body!.getReader()
      const decoder = new TextDecoder()
      let partial = ''
      let buffer = ''
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          partial += decoder.decode(value, { stream: true })
          const lines = partial.split('\n')
          partial = lines.pop() ?? ''
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const data = line.slice(6)
            if (data === '[DONE]') continue
            try {
              buffer += JSON.parse(data)?.choices?.[0]?.delta?.content ?? ''
              send({ status: 'processing', chars: buffer.length })
            } catch { /* partial chunk */ }
          }
        }
        const script = JSON.parse(buffer) as VideoScript
        if (!Array.isArray(script?.scenes) || script.scenes.length === 0) throw new Error('Script had no scenes')
        await prisma.videoProject.update({
          where: { id },
          data: {
            script: script as any,
            youtubeTitle: (script.youtubeTitle ?? video.topic).slice(0, 100),
            description: script.description ?? '',
            tags: (script.tags ?? []).slice(0, 30),
            sceneImages: [],
            voiceover: [],
            thumbnailPath: null,
            videoUrl: null,
            renderRequestId: null,
            lastError: null,
          },
        })
        const updated = await refreshStatus(id)
        send({ status: 'completed', result: serializeVideo(updated!) })
      } catch (e: any) {
        console.error('Script generation error:', e)
        await prisma.videoProject.update({ where: { id }, data: { lastError: `Script: ${e?.message ?? 'failed'}` } }).catch(() => null)
        send({ status: 'error', message: `Script generation failed: ${e?.message ?? 'invalid response'}` })
      } finally {
        controller.close()
      }
    },
  })
  return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' } })
}
