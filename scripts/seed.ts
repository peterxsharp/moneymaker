import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { LAUNCH_VIDEOS, LAUNCH_DATE_ISO } from '../lib/video-launch-plan'

const prisma = new PrismaClient()

const budgetAllocations = [
  { stream: 'youtube', amount: 0, label: 'Faceless YouTube', color: '#10B981' },
  { stream: 'tiktok', amount: 0, label: 'TikTok/Shorts', color: '#3B82F6' },
  { stream: 'affiliate', amount: 230, label: 'Affiliate Marketing', color: '#F59E0B' },
  { stream: 'arbitrage', amount: 150, label: 'Crypto Arbitrage', color: '#8B5CF6' },
  { stream: 'pod', amount: 120, label: 'Print-on-Demand', color: '#EC4899' },
]

const streamSettings = [
  { stream: 'youtube', automationScore: 85, hoursPerWeek: 5, isActive: true, optimistic: 500, realistic: 200, pessimistic: 50 },
  { stream: 'tiktok', automationScore: 90, hoursPerWeek: 3, isActive: true, optimistic: 300, realistic: 100, pessimistic: 20 },
  { stream: 'affiliate', automationScore: 70, hoursPerWeek: 8, isActive: true, optimistic: 800, realistic: 300, pessimistic: 50 },
  { stream: 'arbitrage', automationScore: 60, hoursPerWeek: 4, isActive: true, optimistic: 400, realistic: 150, pessimistic: 0 },
  { stream: 'pod', automationScore: 75, hoursPerWeek: 4, isActive: true, optimistic: 350, realistic: 120, pessimistic: 20 },
]

const streams = ['youtube', 'tiktok', 'affiliate', 'arbitrage', 'pod']
const monthlyProjections: Record<string, number[]> = {
  youtube: [0, 10, 30, 60, 100, 150, 200, 260, 320, 380, 440, 500],
  tiktok: [0, 5, 15, 30, 50, 70, 100, 130, 160, 200, 250, 300],
  affiliate: [0, 0, 10, 30, 60, 100, 150, 200, 300, 400, 550, 800],
  arbitrage: [0, 20, 40, 60, 80, 100, 120, 150, 180, 220, 280, 400],
  pod: [0, 5, 15, 30, 50, 70, 90, 120, 150, 200, 260, 350],
}

async function main() {
  console.log('Seeding database...')

  const testEmail = 'abacus-5e7c836e@example.com'
  const testPassword = await bcrypt.hash('7$TtZempo5', 10)
  await prisma.user.upsert({
    where: { email: testEmail },
    update: { password: testPassword, role: 'admin' },
    create: { email: testEmail, password: testPassword, name: 'Admin', role: 'admin' },
  })
  console.log('Admin user seeded')

  // Budget allocations
  for (const alloc of budgetAllocations) {
    await prisma.budgetAllocation.upsert({
      where: { stream: alloc.stream },
      update: { amount: alloc.amount, label: alloc.label, color: alloc.color },
      create: alloc,
    })
  }
  console.log('Budget allocations seeded')

  // Stream settings
  for (const setting of streamSettings) {
    await prisma.streamSettings.upsert({
      where: { stream: setting.stream },
      update: setting,
      create: setting,
    })
  }
  console.log('Stream settings seeded')

  // Income projections (12 months)
  for (const stream of streams) {
    const projections = monthlyProjections[stream] || []
    for (let i = 0; i < 12; i++) {
      await prisma.incomeEntry.upsert({
        where: { stream_month_year: { stream, month: i + 1, year: 2025 } },
        update: { projected: projections[i] || 0, actual: 0 },
        create: { stream, month: i + 1, year: 2025, projected: projections[i] || 0, actual: 0 },
      })
    }
  }
  console.log('Income projections seeded')

  // YouTube launch slate (never overwrites production progress)
  for (const v of LAUNCH_VIDEOS) {
    await prisma.videoProject.upsert({
      where: { slug: v.slug },
      update: { topic: v.topic, angle: v.angle, factSheet: v.factSheet, sources: v.sources, order: v.order },
      create: { ...v, scheduledFor: new Date(LAUNCH_DATE_ISO) },
    })
  }
  console.log('Launch videos seeded')

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
