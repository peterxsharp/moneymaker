export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api-auth'

const COINGECKO_URL = 'https://api.coingecko.com/api/v3'

export async function GET() {
  const denied = await requireAuth()
  if (denied) return denied
  try {
    const response = await fetch(
      `${COINGECKO_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h`,
      { next: { revalidate: 60 } }
    )

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`)
    }

    const data = await response.json()

    const coins = (data ?? []).map((coin: any) => ({
      id: coin?.id ?? '',
      symbol: coin?.symbol?.toUpperCase?.() ?? '',
      name: coin?.name ?? '',
      price: coin?.current_price ?? 0,
      change24h: coin?.price_change_percentage_24h ?? 0,
      marketCap: coin?.market_cap ?? 0,
      volume: coin?.total_volume ?? 0,
      image: coin?.image ?? '',
      high24h: coin?.high_24h ?? 0,
      low24h: coin?.low_24h ?? 0,
    }))

    // Simulate exchange spreads for arbitrage display
    const exchanges = ['Binance', 'Coinbase', 'Kraken', 'KuCoin', 'Bybit']
    const arbitrageData = (coins ?? []).map((coin: any) => {
      const basePrice = coin?.price ?? 0
      const exchangePrices = exchanges.map((ex: string) => {
        // Create realistic spread variations (0.01% to 0.5%)
        const spreadPercent = (Math.random() * 0.5 + 0.01) / 100
        const direction = Math.random() > 0.5 ? 1 : -1
        return {
          exchange: ex,
          price: Number((basePrice * (1 + direction * spreadPercent)).toFixed(2)),
        }
      })
      const prices = exchangePrices.map((ep: any) => ep?.price ?? 0)
      const minPrice = Math.min(...prices)
      const maxPrice = Math.max(...prices)
      const spread = maxPrice - minPrice
      const spreadPercent = minPrice > 0 ? ((spread / minPrice) * 100) : 0

      return {
        ...coin,
        exchangePrices,
        spread: Number(spread.toFixed(2)),
        spreadPercent: Number(spreadPercent.toFixed(4)),
        buyExchange: exchangePrices.find((ep: any) => ep?.price === minPrice)?.exchange ?? '',
        sellExchange: exchangePrices.find((ep: any) => ep?.price === maxPrice)?.exchange ?? '',
      }
    })

    return NextResponse.json(arbitrageData)
  } catch (error: any) {
    console.error('Crypto prices error:', error)
    return NextResponse.json({ error: error?.message ?? 'Failed to fetch crypto prices' }, { status: 500 })
  }
}
