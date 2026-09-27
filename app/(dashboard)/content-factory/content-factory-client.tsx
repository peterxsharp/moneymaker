'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Video, Calendar, Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NICHES, PLATFORMS, VIDEO_LENGTHS } from '@/lib/streams'
import { useStreaming } from '@/lib/use-streaming'
import { StreamOutput } from '../_components/stream-output'
import { ContentCalendar } from './content-calendar'
import { toast } from 'sonner'

export function ContentFactoryClient() {
  const [niche, setNiche] = useState<string>(NICHES[0])
  const [platform, setPlatform] = useState<string>(PLATFORMS[0])
  const [videoLength, setVideoLength] = useState<string>(VIDEO_LENGTHS[2])
  const [activeTab, setActiveTab] = useState<'generator' | 'calendar'>('generator')
  const { content, isStreaming, error, startStream, reset } = useStreaming()

  const handleGenerate = useCallback(async () => {
    reset()
    await startStream('/api/generate/script', { niche, platform, videoLength })
  }, [niche, platform, videoLength, startStream, reset])

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <h1 className="font-display text-3xl font-bold tracking-tight flex items-center gap-3">
          <Video className="h-8 w-8 text-primary" />
          AI Content Factory
        </h1>
        <p className="text-muted-foreground">Generate viral scripts, titles, and content calendars for faceless channels</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'generator' ? 'default' : 'secondary'}
          onClick={() => setActiveTab('generator')}
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" /> Script Generator
        </Button>
        <Button
          variant={activeTab === 'calendar' ? 'default' : 'secondary'}
          onClick={() => setActiveTab('calendar')}
          className="gap-2"
        >
          <Calendar className="h-4 w-4" /> Content Calendar
        </Button>
      </div>

      {activeTab === 'generator' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-xl border border-border bg-card p-6 space-y-5"
          >
            <h3 className="font-display text-lg font-semibold">Configuration</h3>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Niche</label>
              <div className="grid grid-cols-2 gap-2">
                {(NICHES ?? []).map((n: string) => (
                  <button
                    key={n}
                    onClick={() => setNiche(n)}
                    className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                      niche === n
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-secondary text-muted-foreground hover:text-foreground hover:border-primary/30'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Platform</label>
              <div className="grid grid-cols-3 gap-2">
                {(PLATFORMS ?? []).map((p: string) => (
                  <button
                    key={p}
                    onClick={() => setPlatform(p)}
                    className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                      platform === p
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border bg-secondary text-muted-foreground hover:text-foreground hover:border-primary/30'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Video Length</label>
              <select
                value={videoLength}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setVideoLength(e.target.value)}
                className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {(VIDEO_LENGTHS ?? []).map((vl: string) => (
                  <option key={vl} value={vl}>{vl}</option>
                ))}
              </select>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isStreaming}
              className="w-full gap-2"
              size="lg"
            >
              {isStreaming ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
              ) : (
                <><Sparkles className="h-4 w-4" /> Generate Content</>
              )}
            </Button>

            {/* Voiceover Panel */}
            <div className="rounded-lg border border-border bg-muted/50 p-4">
              <h4 className="text-sm font-semibold text-primary mb-2">Voiceover Tools</h4>
              <ul className="text-xs text-muted-foreground space-y-1.5">
                <li>• <span className="text-foreground">Murf.ai</span> — Free tier, 10 min/month</li>
                <li>• <span className="text-foreground">ElevenLabs</span> — Free tier, realistic AI voices</li>
                <li>• <span className="text-foreground">Google TTS</span> — Free, basic quality</li>
                <li>• <span className="text-foreground">Clipchamp</span> — Built-in TTS, free</li>
                <li>• <span className="text-foreground">CapCut</span> — Free TTS + video editing</li>
              </ul>
            </div>
          </motion.div>

          {/* Output */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <StreamOutput
              content={content}
              isStreaming={isStreaming}
              error={error}
              title="Generated Content"
            />
            {!content && !isStreaming && !error && (
              <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
                <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">Select your configuration and click Generate to create viral content</p>
              </div>
            )}
          </motion.div>
        </div>
      ) : (
        <ContentCalendar />
      )}
    </div>
  )
}
