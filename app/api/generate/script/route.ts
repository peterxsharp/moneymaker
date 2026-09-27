export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/api-auth'

export async function POST(request: NextRequest) {
  const denied = await requireAuth()
  if (denied) return denied
  try {
    const body = await request.json()
    const { niche, platform, videoLength } = body ?? {}

    if (!niche || !platform || !videoLength) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 })
    }

    const systemPrompt = `You are a viral content strategist specializing in faceless ${platform} videos. Generate comprehensive content for a ${videoLength} ${platform} video in the ${niche} niche.

Provide your response in this exact format:

## HOOK (First 3 seconds)
[Write an attention-grabbing hook]

## SCRIPT
[Write the full video script with clear narration cues]

## TITLE OPTIONS
1. [Title 1]
2. [Title 2]
3. [Title 3]

## DESCRIPTION
[SEO-optimized description with keywords]

## HASHTAGS
[15-20 relevant hashtags]

## THUMBNAIL TEXT IDEAS
1. [Idea 1]
2. [Idea 2]
3. [Idea 3]

## VOICEOVER NOTES
- Tone: [recommended tone]
- Pace: [recommended pace]
- Free TTS tools: Murf.ai (free tier), ElevenLabs (free tier), Google TTS, Clipchamp TTS`

    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-5.4-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Create a viral ${videoLength} ${platform} video script for the ${niche} niche. Make it engaging and optimized for the algorithm.` },
        ],
        stream: true,
        max_tokens: 3000,
      }),
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => 'Unknown error')
      return new Response(JSON.stringify({ error: `LLM API error: ${errText}` }), { status: 500 })
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        const decoder = new TextDecoder()
        const encoder = new TextEncoder()
        if (!reader) {
          controller.close()
          return
        }
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            const chunk = decoder.decode(value)
            controller.enqueue(encoder.encode(chunk))
          }
        } catch (error: any) {
          console.error('Stream error:', error)
          controller.error(error)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error('Generate script error:', error)
    return new Response(JSON.stringify({ error: error?.message ?? 'Failed to generate script' }), { status: 500 })
  }
}
