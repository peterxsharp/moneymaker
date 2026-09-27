'use client'

import { CopyButton } from './copy-button'
import { Loader2 } from 'lucide-react'

interface StreamOutputProps {
  content: string
  isStreaming: boolean
  error: string | null
  title?: string
}

export function StreamOutput({ content, isStreaming, error, title }: StreamOutputProps) {
  if (error) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
        <p className="text-sm text-destructive">{error}</p>
      </div>
    )
  }

  if (!content && !isStreaming) return null

  const sections = (content ?? '').split(/(?=## )/g).filter((s: string) => (s?.trim?.()?.length ?? 0) > 0)

  return (
    <div className="space-y-4">
      {title && (
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold">{title}</h3>
          {content && <CopyButton text={content} className="" />}
        </div>
      )}

      <div className="space-y-3">
        {(sections ?? []).map((section: string, i: number) => {
          const lines = (section ?? '').split('\n')
          const heading = (lines?.[0] ?? '').replace(/^##\s*/, '')
          const body = (lines?.slice?.(1) ?? []).join('\n').trim()

          return (
            <div key={i} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-display text-sm font-semibold text-primary">{heading}</h4>
                <CopyButton text={body} />
              </div>
              <div className="text-sm text-foreground/80 whitespace-pre-wrap font-mono leading-relaxed">
                {body}
              </div>
            </div>
          )
        })}
      </div>

      {isStreaming && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span>Generating...</span>
        </div>
      )}
    </div>
  )
}
