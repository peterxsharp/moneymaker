'use client'

import { useState, useCallback } from 'react'

export function useStreaming() {
  const [content, setContent] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startStream = useCallback(async (url: string, body: Record<string, any>) => {
    setContent('')
    setIsStreaming(true)
    setError(null)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({ error: 'Request failed' }))
        throw new Error(errData?.error ?? 'Request failed')
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response body')

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue
            try {
              const parsed = JSON.parse(data)
              const delta = parsed?.choices?.[0]?.delta?.content ?? ''
              if (delta) {
                setContent((prev: string) => (prev ?? '') + delta)
              }
            } catch {
              // Not JSON SSE, raw text chunk
            }
          }
        }
      }
    } catch (err: any) {
      setError(err?.message ?? 'Stream failed')
    } finally {
      setIsStreaming(false)
    }
  }, [])

  const reset = useCallback(() => {
    setContent('')
    setError(null)
    setIsStreaming(false)
  }, [])

  return { content, isStreaming, error, startStream, reset }
}
