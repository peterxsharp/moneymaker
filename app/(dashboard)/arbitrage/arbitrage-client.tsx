'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, RefreshCw, Calculator, ShoppingCart, Loader2, ArrowRight, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CryptoData {
  id: string
  symbol: string
  name: string
  price: number
  change24h: number
  spread: number
  spreadPercent: number
  buyExchange: string
  sellExchange: string
  exchangePrices: { exchange: string; price: number }[]
}

export function ArbitrageClient() {
  const [activeTab, setActiveTab] = useState<'crypto' | 'sports' | 'retail'>('crypto')
  const [cryptoData, setCryptoData] = useState<CryptoData[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  // Sports arb state
  const [odds1, setOdds1] = useState(2.1)
  const [odds2, setOdds2] = useState(2.1)
  const [stake, setStake] = useState(100)

  // Retail arb state
  const [buyPrice, setBuyPrice] = useState(15)
  const [sellPrice, setSellPrice] = useState(29.99)
  const [amazonFee, setAmazonFee] = useState(15)
  const [shippingCost, setShippingCost] = useState(5)

  const fetchCrypto = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const res = await fetch('/api/crypto/prices')
      const data = await res.json()
      if (Array.isArray(data)) setCryptoData(data)
    } catch (err: any) {
      console.error('Crypto fetch error:', err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchCrypto()
  }, [fetchCrypto])

  // Sports arbitrage calc
  const arbPercent = odds1 > 0 && odds2 > 0 ? ((1 / odds1 + 1 / odds2) * 100) : 200
  const isArbOpportunity = arbPercent < 100
  const guaranteedProfit = isArbOpportunity ? ((1 - arbPercent / 100) * (stake ?? 0) * 100 / 100) : 0
  const stake1 = isArbOpportunity ? (stake ?? 0) * (1 / odds1) / (1 / odds1 + 1 / odds2) : (stake ?? 0) / 2
  const stake2 = (stake ?? 0) - stake1

  // Retail arb calc
  const amazonFeeAmount = (sellPrice ?? 0) * ((amazonFee ?? 0) / 100)
  const totalCost = (buyPrice ?? 0) + (shippingCost ?? 0)
  const netProfit = (sellPrice ?? 0) - amazonFeeAmount - totalCost
  const profitMargin = (sellPrice ?? 0) > 0 ? ((netProfit / (sellPrice ?? 1)) * 100) : 0
  const roi = totalCost > 0 ? ((netProfit / totalCost) * 100) : 0

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <h1 className="font-display text-3xl font-bold tracking-tight flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-primary" />
          Arbitrage Scanner
        </h1>
        <p className="text-muted-foreground">Monitor spreads and calculate guaranteed profits</p>
      </motion.div>

      <div className="flex flex-wrap gap-2">
        {[
          { key: 'crypto', label: 'Crypto Arbitrage', icon: ArrowUpDown },
          { key: 'sports', label: 'Sports Arbitrage', icon: Calculator },
          { key: 'retail', label: 'Retail Arbitrage', icon: ShoppingCart },
        ].map((tab: any) => (
          <Button key={tab?.key} variant={activeTab === tab?.key ? 'default' : 'secondary'} onClick={() => setActiveTab(tab?.key)} className="gap-2">
            <tab.icon className="h-4 w-4" /> {tab?.label}
          </Button>
        ))}
      </div>

      {/* Crypto Tab */}
      {activeTab === 'crypto' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Live prices from CoinGecko • Spread simulated across exchanges</p>
            <Button variant="secondary" size="sm" onClick={() => fetchCrypto(true)} disabled={refreshing} className="gap-2">
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
            </Button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Coin</th>
                      <th className="text-right p-3 text-xs font-medium text-muted-foreground uppercase">Price</th>
                      <th className="text-right p-3 text-xs font-medium text-muted-foreground uppercase">24h</th>
                      <th className="text-right p-3 text-xs font-medium text-muted-foreground uppercase">Spread</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Buy</th>
                      <th className="text-left p-3 text-xs font-medium text-muted-foreground uppercase">Sell</th>
                      <th className="text-right p-3 text-xs font-medium text-muted-foreground uppercase">Spread %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(cryptoData ?? []).map((coin: CryptoData) => (
                      <tr key={coin?.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{coin?.name}</span>
                            <span className="text-xs text-muted-foreground font-mono">{coin?.symbol}</span>
                          </div>
                        </td>
                        <td className="p-3 text-right font-mono text-sm">${coin?.price?.toLocaleString?.('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) ?? '0'}</td>
                        <td className={`p-3 text-right font-mono text-sm ${(coin?.change24h ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {(coin?.change24h ?? 0) >= 0 ? '+' : ''}{coin?.change24h?.toFixed?.(2) ?? '0'}%
                        </td>
                        <td className="p-3 text-right font-mono text-sm text-primary">${coin?.spread?.toFixed?.(2) ?? '0'}</td>
                        <td className="p-3 text-sm text-muted-foreground">{coin?.buyExchange}</td>
                        <td className="p-3 text-sm text-muted-foreground">{coin?.sellExchange}</td>
                        <td className="p-3 text-right">
                          <span className={`text-xs px-2 py-1 rounded-full font-mono ${
                            (coin?.spreadPercent ?? 0) > 0.1 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-muted text-muted-foreground'
                          }`}>
                            {coin?.spreadPercent?.toFixed?.(4) ?? '0'}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Sports Tab */}
      {activeTab === 'sports' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-border bg-card p-6 space-y-5">
            <h3 className="font-display text-lg font-semibold">Sports Arbitrage Calculator</h3>
            <p className="text-sm text-muted-foreground">Enter decimal odds from two bookmakers to find guaranteed profit opportunities</p>

            <div className="space-y-4">
              {[
                { label: 'Bookmaker 1 Odds', value: odds1, setter: setOdds1, min: 1.01, max: 10, step: 0.01 },
                { label: 'Bookmaker 2 Odds', value: odds2, setter: setOdds2, min: 1.01, max: 10, step: 0.01 },
                { label: 'Total Stake ($)', value: stake, setter: setStake, min: 10, max: 10000, step: 10 },
              ].map((field: any) => (
                <div key={field?.label} className="space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm font-medium text-muted-foreground">{field?.label}</label>
                    <span className="text-sm font-mono text-primary">{field?.value}</span>
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
          </div>

          <div className="rounded-xl border border-border bg-card p-6 flex flex-col items-center justify-center">
            <div className={`text-center p-6 rounded-lg ${isArbOpportunity ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
              <p className="text-sm text-muted-foreground mb-1">Arbitrage Opportunity</p>
              <p className={`font-display text-3xl font-bold ${isArbOpportunity ? 'text-emerald-400' : 'text-red-400'}`}>
                {isArbOpportunity ? 'YES' : 'NO'}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Market: {arbPercent?.toFixed?.(2) ?? '0'}% (below 100% = opportunity)
              </p>
            </div>

            {isArbOpportunity && (
              <div className="mt-6 space-y-3 w-full">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Stake on Outcome 1:</span>
                  <span className="font-mono text-primary">${stake1?.toFixed?.(2) ?? '0'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Stake on Outcome 2:</span>
                  <span className="font-mono text-primary">${stake2?.toFixed?.(2) ?? '0'}</span>
                </div>
                <div className="border-t border-border pt-3 flex justify-between text-sm">
                  <span className="font-medium">Guaranteed Profit:</span>
                  <span className="font-mono text-emerald-400 font-bold">${guaranteedProfit?.toFixed?.(2) ?? '0'}</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Retail Tab */}
      {activeTab === 'retail' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-border bg-card p-6 space-y-5">
            <h3 className="font-display text-lg font-semibold">Retail Arbitrage Calculator</h3>
            <p className="text-sm text-muted-foreground">Calculate profit margins for Amazon FBA reselling</p>

            {[
              { label: 'Buy Price ($)', value: buyPrice, setter: setBuyPrice, min: 1, max: 500, step: 0.5 },
              { label: 'Sell Price ($)', value: sellPrice, setter: setSellPrice, min: 1, max: 1000, step: 0.5 },
              { label: 'Amazon Fee (%)', value: amazonFee, setter: setAmazonFee, min: 5, max: 45, step: 1 },
              { label: 'Shipping ($)', value: shippingCost, setter: setShippingCost, min: 0, max: 50, step: 0.5 },
            ].map((field: any) => (
              <div key={field?.label} className="space-y-2">
                <div className="flex justify-between">
                  <label className="text-sm font-medium text-muted-foreground">{field?.label}</label>
                  <span className="text-sm font-mono text-primary">{field?.label?.includes?.('%') ? `${field?.value}%` : `$${field?.value}`}</span>
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

            <a
              href={`https://www.amazon.com/s?k=&ref=nb_sb_noss`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
            >
              Search Amazon for Products <ArrowRight className="h-3 w-3" />
            </a>
          </div>

          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <h3 className="font-display text-lg font-semibold">Profit Breakdown</h3>
            <div className="space-y-3">
              {[
                { label: 'Sell Price', value: sellPrice, color: 'text-foreground' },
                { label: 'Amazon Fee', value: -amazonFeeAmount, color: 'text-red-400' },
                { label: 'Product Cost', value: -buyPrice, color: 'text-red-400' },
                { label: 'Shipping', value: -shippingCost, color: 'text-red-400' },
              ].map((item: any) => (
                <div key={item?.label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{item?.label}</span>
                  <span className={`font-mono ${item?.color}`}>
                    {(item?.value ?? 0) >= 0 ? '' : '-'}${Math.abs(item?.value ?? 0)?.toFixed?.(2) ?? '0'}
                  </span>
                </div>
              ))}
              <div className="border-t border-border pt-3">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Net Profit</span>
                  <span className={`font-mono font-bold ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    ${netProfit?.toFixed?.(2) ?? '0'}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Profit Margin</span>
                  <span className="font-mono text-primary">{profitMargin?.toFixed?.(1) ?? '0'}%</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground">ROI</span>
                  <span className="font-mono text-primary">{roi?.toFixed?.(1) ?? '0'}%</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
