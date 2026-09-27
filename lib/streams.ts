export const INCOME_STREAMS = [
  { id: 'youtube', label: 'Faceless YouTube', color: '#10B981', icon: 'Video' },
  { id: 'tiktok', label: 'TikTok/Shorts', color: '#3B82F6', icon: 'Smartphone' },
  { id: 'affiliate', label: 'Affiliate Marketing', color: '#F59E0B', icon: 'Link2' },
  { id: 'arbitrage', label: 'Crypto Arbitrage', color: '#8B5CF6', icon: 'TrendingUp' },
  { id: 'pod', label: 'Print-on-Demand', color: '#EC4899', icon: 'Shirt' },
] as const

export const DEFAULT_BUDGET: Record<string, { amount: number; label: string; color: string }> = {
  youtube: { amount: 0, label: 'Faceless YouTube', color: '#10B981' },
  tiktok: { amount: 0, label: 'TikTok/Shorts', color: '#3B82F6' },
  affiliate: { amount: 230, label: 'Affiliate Marketing', color: '#F59E0B' },
  arbitrage: { amount: 150, label: 'Crypto Arbitrage', color: '#8B5CF6' },
  pod: { amount: 120, label: 'Print-on-Demand', color: '#EC4899' },
}

export const TOTAL_SEED = 500

export const NICHES = ['Finance', 'Motivation', 'AI/Tech', 'True Crime', 'Fitness', 'History'] as const
export const PLATFORMS = ['YouTube', 'TikTok', 'Instagram'] as const
export const VIDEO_LENGTHS = ['30 seconds', '60 seconds', '3 minutes', '8 minutes', '10+ minutes'] as const
