# Project Overview

## Project
**Passive Income Hub / "Making Money" / TechAssist-Edge YouTube channel** — a single-user fintech + creator command center (branded **Pharaoh's Edge Command Center**) built as a Next.js SaaS app.

## Goal
Build durable passive income through a **YouTube-first, multi-platform video distribution** engine layered with affiliate content and a software SaaS. Create one genuinely useful content asset per topic, transform it for each channel, and layer monetization around it (the concentration principle from the strategy report).

## Platforms
- **YouTube** — primary long-term asset (faceless tech channel `@TechAssist-Edge`).
- **Vimeo** — ad-free portfolio host + On Demand.
- **Dailymotion** — automated cross-post partner.
- **Rumble** — manual cross-post (no public API), licensing revenue.
- **TikTok** — Phase 2 (Creator Rewards; 10K followers + 100K views/30d).
- **Instagram** — Phase 2 (Gifts / Subscriptions / Reels ads).

## Revenue streams
- YouTube AdSense (ad revenue share) + fan funding.
- Vimeo On Demand / OTT (sell/rent).
- Dailymotion Partner Program.
- Rumble revenue share / video licensing.
- Affiliate marketing (e.g. Amazon Associates) attached to the video library.
- SaaS subscriptions (the command-center app itself).

## Tech
- **App:** Next.js 14 (App Router) SaaS, deployed at **pharaohsedge.online** and **techassist.abacusai.app**.
- **Data:** Prisma ORM → PostgreSQL.
- **Auth:** NextAuth/Auth.js v5, credentials + email allowlist.
- **Storage:** AWS S3 for all media assets.
- **AI/media:** AbacusAI LLM (scripts/briefs), `gemini-3.1-flash-image` (thumbnails/scenes), OpenAI `tts-1` (voiceover), FFmpeg render service.
- **Distribution APIs:** YouTube Data API v3, Vimeo, Dailymotion; Rumble manual.

## App modules
Dashboard overview, YouTube Studio (production pipeline + distribution + monetization tracker), Content Factory, Affiliate Hub, Arbitrage Scanner, Print-on-Demand, Income Simulator, Settings (budget allocation).

## Timeline
- **First videos:** Oct 5, 2026 (10-video launch slate for TechAssist Edge).
- **Monetization targets:** progress toward YouTube Partner Program + Dailymotion partner eligibility by **end of Q4 2026**; TikTok/Instagram integrations in Phase 2.

## Budget frame
Evidence-based deployment of a **$500 seed budget** (see `PASSIVE-INCOME-STRATEGY.md`): $200 original YouTube production, $75 short-form repurposing, $75 affiliate website/content hub, $150 cash reserve.

## Related docs
- `PASSIVE-INCOME-STRATEGY.md` — the full evidence-based strategy report.
- `VIDEO-LAUNCH-PLAN.md` — the 10-video launch slate + fact sheets.
- `../ARCHITECTURE.md`, `../SCHEMA.md`, `../API-ROUTES.md`, `../MONETIZATION-PROGRAMS.md`.
- `../SESSION-2026-09-27-CHANGES.md` — this session's changelog.
