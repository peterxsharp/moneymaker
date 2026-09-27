export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/api-auth'

export async function POST(request: NextRequest) {
  const denied = await requireAuth()
  if (denied) return denied
  try {
    const body = await request.json()
    const { niche, platform } = body ?? {}

    const systemPrompt = `You are a social media content calendar strategist. Generate a 30-day posting schedule.

Respond with raw JSON only. No markdown, no code blocks.

Use this exact JSON structure:
{
  "calendar": [
    {
      "day": 1,
      "title": "Video title",
      "description": "Brief description of the content",
      "platform": "${platform || 'YouTube'}",
      "niche": "${niche || 'Finance'}"
    }
  ]
}

Generate exactly 30 items, one per day. Make titles catchy and varied. Mix content types (educational, entertainment, trending topics, listicles, storytelling).`

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
          { role: 'user', content: `Create a 30-day content calendar for ${platform || 'YouTube'} in the ${niche || 'Finance'} niche. Each day should have a unique, engaging video idea.` },
        ],
        stream: true,
        max_tokens: 4000,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const errText = await response.text().catch(() => 'Unknown error')
      return new Response(JSON.stringify({ error: `LLM API error: ${errText}` }), { status: 500 })
    }

    const encoder = new TextEncoder()
    const decoder = new TextDecoder()
    let buffer = ''
    let partialRead = ''

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        if (!reader) { controller.close(); return }
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            partialRead += decoder.decode(value, { stream: true })
            const lines = partialRead.split('\n')
            partialRead = lines.pop() ?? ''
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') {
                  try {
                    const finalResult = JSON.parse(buffer)
                    const finalData = JSON.stringify({ status: 'completed', result: finalResult })
                    controller.enqueue(encoder.encode(`data: ${finalData}\n\n`))
                  } catch (e: any) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ status: 'error', message: 'Failed to parse calendar' })}\n\n`))
                  }
                  return
                }
                try {
                  const parsed = JSON.parse(data)
                  buffer += parsed?.choices?.[0]?.delta?.content ?? ''
                  const progressData = JSON.stringify({ status: 'processing', message: 'Generating calendar...' })
                  controller.enqueue(encoder.encode(`data: ${progressData}\n\n`))
                } catch (e: any) {
                  // Skip invalid JSON
                }
              }
            }
          }
          // Handle remaining buffer if no [DONE] received
          if (buffer) {
            try {
              const finalResult = JSON.parse(buffer)
              const finalData = JSON.stringify({ status: 'completed', result: finalResult })
              controller.enqueue(encoder.encode(`data: ${finalData}\n\n`))
            } catch (e: any) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ status: 'error', message: 'Failed to parse response' })}\n\n`))
            }
          }
        } catch (error: any) {
          console.error('Stream error:', error)
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ status: 'error', message: error?.message ?? 'Stream error' })}\n\n`))
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
    })
  } catch (error: any) {
    console.error('Generate calendar error:', error)
    return new Response(JSON.stringify({ error: error?.message ?? 'Failed to generate calendar' }), { status: 500 })
  }
}
