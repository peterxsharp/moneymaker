export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/api-auth'

export async function POST(request: NextRequest) {
  const denied = await requireAuth()
  if (denied) return denied
  try {
    const body = await request.json()
    const { niche } = body ?? {}

    if (!niche) {
      return new Response(JSON.stringify({ error: 'Missing niche' }), { status: 400 })
    }

    const systemPrompt = `You are an expert affiliate marketing website architect. Generate a complete niche website plan.

Provide your response in this exact format:

## SITE STRUCTURE

### Homepage
- Purpose: [description]
- Key elements: [list]

### Category Pages
1. [Category 1] - [description]
2. [Category 2] - [description]
3. [Category 3] - [description]
4. [Category 4] - [description]

### Essential Pages
- About, Contact, Privacy Policy, Disclaimer

## CONTENT TOPICS (Top 20)
1. [Topic] - [target keyword] - [search volume estimate]
[...]

## INTERNAL LINKING STRATEGY
[Detailed linking plan]

## MONETIZATION PLAN
- Primary: [affiliate programs]
- Secondary: [display ads, email list, etc.]

## DOMAIN NAME IDEAS
1. [domain1.com]
2. [domain2.com]
3. [domain3.com]

## TECH STACK RECOMMENDATION
[WordPress/hosting suggestions for minimal cost]`

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
          { role: 'user', content: `Create a complete niche website plan for an affiliate marketing site in the "${niche}" niche. Include site structure, content topics, and monetization strategy.` },
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
    return new Response(JSON.stringify({ error: error?.message ?? 'Failed to generate niche site plan' }), { status: 500 })
  }
}
