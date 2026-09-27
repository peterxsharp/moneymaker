export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/api-auth'

export async function POST(request: NextRequest) {
  const denied = await requireAuth()
  if (denied) return denied
  try {
    const body = await request.json()
    const { niche, occasion } = body ?? {}

    const systemPrompt = `You are a print-on-demand design strategist. Generate creative, trending, and profitable design ideas.

Provide your response in this exact format:

## DESIGN IDEAS

### 1. [Design Name]
- **Text/Slogan:** [The text on the product]
- **Visual Style:** [Description of the design style]
- **Best Products:** [T-shirt, mug, poster, etc.]
- **Target Audience:** [Who would buy this]
- **Trend Score:** [1-10]

[Repeat for 8-10 design ideas]

## TRENDING THEMES
[Current trends to capitalize on]

## COLOR PALETTE SUGGESTIONS
[Popular color combinations for each design]

## PRICING STRATEGY
[Recommended price points per platform]`

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
          { role: 'user', content: `Generate profitable print-on-demand design ideas${niche ? ` for the ${niche} niche` : ''}${occasion ? ` themed around ${occasion}` : ''}. Focus on designs that sell well on Etsy, Redbubble, and Merch by Amazon.` },
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
    console.error('Generate designs error:', error)
    return new Response(JSON.stringify({ error: error?.message ?? 'Failed to generate designs' }), { status: 500 })
  }
}
