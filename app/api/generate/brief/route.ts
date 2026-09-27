export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/api-auth'

export async function POST(request: NextRequest) {
  const denied = await requireAuth()
  if (denied) return denied
  try {
    const body = await request.json()
    const { niche, topic } = body ?? {}

    if (!niche) {
      return new Response(JSON.stringify({ error: 'Missing niche' }), { status: 400 })
    }

    const systemPrompt = `You are an expert SEO content strategist for affiliate marketing websites. Generate a comprehensive blog post content brief.

Provide your response in this exact format:

## TARGET KEYWORD
[Primary keyword]

## SECONDARY KEYWORDS
[5-8 secondary/LSI keywords]

## SUGGESTED TITLE
[SEO-optimized title with keyword]

## META DESCRIPTION
[155 characters max]

## ARTICLE OUTLINE
[H2 and H3 headings with brief descriptions of what to cover]

## WORD COUNT TARGET
[Recommended word count]

## INTERNAL LINKING OPPORTUNITIES
[3-5 suggested internal link topics]

## AFFILIATE INTEGRATION POINTS
[Where to naturally insert affiliate links]

## CONTENT ANGLE
[Unique angle to differentiate from competitors]`

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
          { role: 'user', content: `Create a comprehensive SEO content brief for an affiliate marketing blog post in the ${niche} niche${topic ? ` about: ${topic}` : ''}. Focus on high buyer-intent keywords.` },
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
        if (!reader) { controller.close(); return }
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            controller.enqueue(encoder.encode(decoder.decode(value)))
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
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
    })
  } catch (error: any) {
    console.error('Generate brief error:', error)
    return new Response(JSON.stringify({ error: error?.message ?? 'Failed to generate brief' }), { status: 500 })
  }
}
