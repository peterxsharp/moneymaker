'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Shirt, Sparkles, Calculator, CheckSquare, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStreaming } from '@/lib/use-streaming'
import { StreamOutput } from '../_components/stream-output'

const occasions = ['Christmas', 'Halloween', 'Valentine\'s Day', 'Mother\'s Day', 'Father\'s Day', 'Back to School', 'Summer', 'Trending Memes', 'Motivational', 'Pet Lovers', 'Gamer', 'Nurse/Teacher']
const platforms = [
  { name: 'Etsy', listingFee: 0.20, transactionFee: 6.5, processingFee: 3, printCost: 12 },
  { name: 'Redbubble', listingFee: 0, transactionFee: 0, processingFee: 0, printCost: 13 },
  { name: 'Merch by Amazon', listingFee: 0, transactionFee: 0, processingFee: 0, printCost: 11.50 },
]

const uploadChecklist = [
  { platform: 'Etsy', steps: ['Create Etsy seller account', 'Connect Printful/Printify', 'Upload design (300 DPI, PNG)', 'Write SEO title (140 chars)', 'Add 13 tags', 'Set price ($19.99-24.99)', 'Write description with keywords', 'Add to relevant sections', 'Enable auto-renew'] },
  { platform: 'Redbubble', steps: ['Create Redbubble account', 'Upload design (PNG, 4500x5400)', 'Write title with keywords', 'Add tags (15 max)', 'Select product types', 'Adjust design placement', 'Set markup (20-40%)', 'Publish'] },
  { platform: 'Merch by Amazon', steps: ['Apply for MBA account', 'Upload design (4500x5400 PNG)', 'Choose product type', 'Write bullet points (2)', 'Set price ($15.99-19.99)', 'Select colors', 'Submit for review', 'Wait 24-72h approval'] },
]

export function PODClient() {
  const [activeTab, setActiveTab] = useState<'designs' | 'calculator' | 'checklist'>('designs')
  const [niche, setNiche] = useState('')
  const [occasion, setOccasion] = useState('')
  const { content, isStreaming, error, startStream, reset } = useStreaming()

  // Calculator
  const [sellPrice, setSellPrice] = useState(22.99)
  const [selectedPlatform, setSelectedPlatform] = useState(0)

  const plat = platforms?.[selectedPlatform] ?? platforms[0]
  const listingFee = plat?.listingFee ?? 0
  const transactionFeeAmt = (sellPrice ?? 0) * ((plat?.transactionFee ?? 0) / 100)
  const processingFeeAmt = (sellPrice ?? 0) * ((plat?.processingFee ?? 0) / 100)
  const printCost = plat?.printCost ?? 0
  const netProfit = (sellPrice ?? 0) - listingFee - transactionFeeAmt - processingFeeAmt - printCost

  const handleGenerate = useCallback(async () => {
    reset()
    await startStream('/api/generate/designs', { niche, occasion })
  }, [niche, occasion, startStream, reset])

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <h1 className="font-display text-3xl font-bold tracking-tight flex items-center gap-3">
          <Shirt className="h-8 w-8 text-primary" />
          Print-on-Demand
        </h1>
        <p className="text-muted-foreground">Design ideas, profit calculator, and upload guides</p>
      </motion.div>

      <div className="flex flex-wrap gap-2">
        {[
          { key: 'designs', label: 'Design Ideas', icon: Sparkles },
          { key: 'calculator', label: 'Profit Calculator', icon: Calculator },
          { key: 'checklist', label: 'Upload Checklist', icon: CheckSquare },
        ].map((tab: any) => (
          <Button key={tab?.key} variant={activeTab === tab?.key ? 'default' : 'secondary'} onClick={() => setActiveTab(tab?.key)} className="gap-2">
            <tab.icon className="h-4 w-4" /> {tab?.label}
          </Button>
        ))}
      </div>

      {activeTab === 'designs' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-display text-lg font-semibold">Generate Design Ideas</h3>
            <input
              type="text"
              value={niche}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNiche(e.target.value)}
              placeholder="Niche (e.g., Dog Lovers)"
              className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Occasion/Theme</label>
              <div className="flex flex-wrap gap-1.5">
                {(occasions ?? []).map((o: string) => (
                  <button
                    key={o}
                    onClick={() => setOccasion(occasion === o ? '' : o)}
                    className={`px-2 py-1 text-[11px] rounded-md border transition-all ${
                      occasion === o ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={handleGenerate} disabled={isStreaming} className="w-full gap-2">
              {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generate Ideas
            </Button>
          </motion.div>
          <div className="lg:col-span-2">
            <StreamOutput content={content} isStreaming={isStreaming} error={error} title="Design Ideas" />
            {!content && !isStreaming && !error && (
              <div className="rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
                <Sparkles className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">Enter a niche or pick an occasion to generate design ideas</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'calculator' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-border bg-card p-6 space-y-5">
            <h3 className="font-display text-lg font-semibold">POD Profit Calculator</h3>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Platform</label>
              <div className="grid grid-cols-3 gap-2">
                {(platforms ?? []).map((p: any, i: number) => (
                  <button
                    key={p?.name}
                    onClick={() => setSelectedPlatform(i)}
                    className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${
                      selectedPlatform === i ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {p?.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-muted-foreground">Sell Price</label>
                <span className="text-sm font-mono text-primary">${sellPrice?.toFixed?.(2) ?? '0'}</span>
              </div>
              <input
                type="range" min={10} max={50} step={0.5} value={sellPrice}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSellPrice(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-display text-lg font-semibold">Breakdown — {plat?.name}</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Sell Price</span><span className="font-mono">${(sellPrice ?? 0)?.toFixed?.(2)}</span></div>
              {listingFee > 0 && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Listing Fee</span><span className="font-mono text-red-400">-${listingFee?.toFixed?.(2)}</span></div>}
              {transactionFeeAmt > 0 && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Transaction Fee ({plat?.transactionFee}%)</span><span className="font-mono text-red-400">-${transactionFeeAmt?.toFixed?.(2)}</span></div>}
              {processingFeeAmt > 0 && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Processing Fee ({plat?.processingFee}%)</span><span className="font-mono text-red-400">-${processingFeeAmt?.toFixed?.(2)}</span></div>}
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Print/Base Cost</span><span className="font-mono text-red-400">-${printCost?.toFixed?.(2)}</span></div>
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-medium">Net Profit</span>
                <span className={`font-mono font-bold text-lg ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>${netProfit?.toFixed?.(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground">Per sale • Sell 100/month = ${((netProfit ?? 0) * 100)?.toFixed?.(0)}/month</p>
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'checklist' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(uploadChecklist ?? []).map((plat: any) => (
            <div key={plat?.platform} className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-display text-lg font-semibold mb-4">{plat?.platform}</h3>
              <ol className="space-y-2">
                {(plat?.steps ?? []).map((step: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="shrink-0 h-5 w-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-mono">{i + 1}</span>
                    <span className="text-muted-foreground">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
