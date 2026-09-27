'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Link2, Globe, FileText, Calculator, Sparkles, Loader2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStreaming } from '@/lib/use-streaming'
import { StreamOutput } from '../_components/stream-output'

const affiliatePrograms = [
  { name: 'Amazon Associates', commission: '1-10%', cookie: '24 hours', niche: 'All', url: 'https://affiliate-program.amazon.com', difficulty: 'Easy' },
  { name: 'ClickBank', commission: '50-75%', cookie: '60 days', niche: 'Digital Products', url: 'https://www.clickbank.com', difficulty: 'Easy' },
  { name: 'ShareASale', commission: 'Varies', cookie: '30 days', niche: 'All', url: 'https://www.shareasale.com', difficulty: 'Medium' },
  { name: 'Impact', commission: 'Varies', cookie: '30 days', niche: 'SaaS/Tech', url: 'https://impact.com', difficulty: 'Medium' },
  { name: 'CJ Affiliate', commission: 'Varies', cookie: '30-45 days', niche: 'All', url: 'https://www.cj.com', difficulty: 'Medium' },
  { name: 'Awin', commission: 'Varies', cookie: '30 days', niche: 'All', url: 'https://www.awin.com', difficulty: 'Medium' },
  { name: 'PartnerStack', commission: '20-30%', cookie: '90 days', niche: 'SaaS', url: 'https://partnerstack.com', difficulty: 'Easy' },
  { name: 'Rakuten', commission: 'Varies', cookie: '30 days', niche: 'Retail', url: 'https://rakutenadvertising.com', difficulty: 'Hard' },
]

export function AffiliateHubClient() {
  const [activeTab, setActiveTab] = useState<'programs' | 'planner' | 'brief' | 'calculator'>('programs')
  const [plannerNiche, setPlannerNiche] = useState('')
  const [briefNiche, setBriefNiche] = useState('')
  const [briefTopic, setBriefTopic] = useState('')
  const plannerStream = useStreaming()
  const briefStream = useStreaming()

  // Calculator state
  const [visitors, setVisitors] = useState(5000)
  const [ctr, setCtr] = useState(5)
  const [convRate, setConvRate] = useState(3)
  const [avgComm, setAvgComm] = useState(25)

  const projectedIncome = Math.round((visitors * (ctr / 100) * (convRate / 100) * avgComm))

  const handlePlannerGenerate = useCallback(async () => {
    if (!plannerNiche) return
    plannerStream.reset()
    await plannerStream.startStream('/api/generate/niche-site', { niche: plannerNiche })
  }, [plannerNiche, plannerStream])

  const handleBriefGenerate = useCallback(async () => {
    if (!briefNiche) return
    briefStream.reset()
    await briefStream.startStream('/api/generate/brief', { niche: briefNiche, topic: briefTopic })
  }, [briefNiche, briefTopic, briefStream])

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <h1 className="font-display text-3xl font-bold tracking-tight flex items-center gap-3">
          <Link2 className="h-8 w-8 text-primary" />
          Affiliate Marketing Hub
        </h1>
        <p className="text-muted-foreground">Tools and resources to build your affiliate income stream</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { key: 'programs', label: 'Programs', icon: ExternalLink },
          { key: 'planner', label: 'Site Planner', icon: Globe },
          { key: 'brief', label: 'Content Briefs', icon: FileText },
          { key: 'calculator', label: 'Income Calculator', icon: Calculator },
        ].map((tab: any) => (
          <Button
            key={tab?.key}
            variant={activeTab === tab?.key ? 'default' : 'secondary'}
            onClick={() => setActiveTab(tab?.key)}
            className="gap-2"
          >
            <tab.icon className="h-4 w-4" /> {tab?.label}
          </Button>
        ))}
      </div>

      {/* Programs Table */}
      {activeTab === 'programs' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase">Program</th>
                  <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase">Commission</th>
                  <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase">Cookie</th>
                  <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase">Niche</th>
                  <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase">Difficulty</th>
                  <th className="text-left p-4 text-xs font-medium text-muted-foreground uppercase">Link</th>
                </tr>
              </thead>
              <tbody>
                {(affiliatePrograms ?? []).map((prog: any, i: number) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="p-4 font-medium text-sm">{prog?.name}</td>
                    <td className="p-4 text-sm text-primary font-mono">{prog?.commission}</td>
                    <td className="p-4 text-sm text-muted-foreground">{prog?.cookie}</td>
                    <td className="p-4 text-sm">{prog?.niche}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        prog?.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' :
                        prog?.difficulty === 'Medium' ? 'bg-yellow-500/10 text-yellow-400' :
                        'bg-red-500/10 text-red-400'
                      }`}>{prog?.difficulty}</span>
                    </td>
                    <td className="p-4">
                      <a href={prog?.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm flex items-center gap-1">
                        Apply <ExternalLink className="h-3 w-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Site Planner */}
      {activeTab === 'planner' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-display text-lg font-semibold">Niche Website Planner</h3>
            <p className="text-sm text-muted-foreground">Enter a niche to generate a complete site structure</p>
            <input
              type="text"
              value={plannerNiche}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPlannerNiche(e.target.value)}
              placeholder="e.g., Home Fitness Equipment"
              className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button onClick={handlePlannerGenerate} disabled={plannerStream.isStreaming || !plannerNiche} className="w-full gap-2">
              {plannerStream.isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Globe className="h-4 w-4" />}
              Generate Site Plan
            </Button>
          </motion.div>
          <div className="lg:col-span-2">
            <StreamOutput content={plannerStream.content} isStreaming={plannerStream.isStreaming} error={plannerStream.error} title="Site Structure" />
            {!plannerStream.content && !plannerStream.isStreaming && (
              <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
                <Globe className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">Enter a niche to get a full website blueprint</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content Brief Generator */}
      {activeTab === 'brief' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-display text-lg font-semibold">SEO Content Brief</h3>
            <p className="text-sm text-muted-foreground">Generate an SEO-optimized blog post brief</p>
            <input
              type="text"
              value={briefNiche}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBriefNiche(e.target.value)}
              placeholder="Niche (e.g., Personal Finance)"
              className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="text"
              value={briefTopic}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBriefTopic(e.target.value)}
              placeholder="Topic (optional)"
              className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button onClick={handleBriefGenerate} disabled={briefStream.isStreaming || !briefNiche} className="w-full gap-2">
              {briefStream.isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              Generate Brief
            </Button>
          </motion.div>
          <div className="lg:col-span-2">
            <StreamOutput content={briefStream.content} isStreaming={briefStream.isStreaming} error={briefStream.error} title="Content Brief" />
            {!briefStream.content && !briefStream.isStreaming && (
              <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">Enter a niche to generate an SEO content brief</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Income Calculator */}
      {activeTab === 'calculator' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-border bg-card p-6 space-y-5">
            <h3 className="font-display text-lg font-semibold">Affiliate Income Calculator</h3>

            {[
              { label: 'Monthly Visitors', value: visitors, setter: setVisitors, min: 100, max: 100000, step: 100, format: (v: number) => v?.toLocaleString?.('en-US') ?? '0' },
              { label: 'Click-Through Rate (%)', value: ctr, setter: setCtr, min: 0.5, max: 20, step: 0.5, format: (v: number) => `${v}%` },
              { label: 'Conversion Rate (%)', value: convRate, setter: setConvRate, min: 0.5, max: 15, step: 0.5, format: (v: number) => `${v}%` },
              { label: 'Average Commission ($)', value: avgComm, setter: setAvgComm, min: 1, max: 200, step: 1, format: (v: number) => `$${v}` },
            ].map((field: any) => (
              <div key={field?.label} className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-muted-foreground">{field?.label}</label>
                  <span className="text-sm font-mono text-primary">{field?.format?.(field?.value) ?? field?.value}</span>
                </div>
                <input
                  type="range"
                  min={field?.min}
                  max={field?.max}
                  step={field?.step}
                  value={field?.value}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => field?.setter?.(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-card p-6 flex flex-col items-center justify-center">
            <p className="text-sm text-muted-foreground mb-2">Projected Monthly Income</p>
            <p className="font-display text-5xl font-bold text-primary">${projectedIncome?.toLocaleString?.('en-US') ?? '0'}</p>
            <p className="text-sm text-muted-foreground mt-4">Annual: ${((projectedIncome ?? 0) * 12)?.toLocaleString?.('en-US') ?? '0'}</p>
            <div className="mt-6 text-xs text-muted-foreground space-y-1 text-center">
              <p>Clicks: {Math.round((visitors ?? 0) * ((ctr ?? 0) / 100))?.toLocaleString?.('en-US') ?? '0'}/month</p>
              <p>Conversions: {Math.round((visitors ?? 0) * ((ctr ?? 0) / 100) * ((convRate ?? 0) / 100))?.toLocaleString?.('en-US') ?? '0'}/month</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
