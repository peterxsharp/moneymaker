# Architecture Overview

## Tech stack

- **Framework:** Next.js 14 (App Router, React Server Components + client components).
- **ORM / DB:** Prisma ORM → PostgreSQL.
- **Auth:** NextAuth / Auth.js v5 (Credentials provider, JWT session strategy, PrismaAdapter, email allowlist).
- **Storage:** AWS S3 (rendered MP4s, thumbnails, scene images, voiceover WAVs).
- **AI / media:**
  - AbacusAI LLM (`gpt-5.4`) — script/brief/calendar/site generation.
  - `gemini-3.1-flash-image` — thumbnail + scene image generation.
  - OpenAI `tts-1` — voiceover synthesis.
  - FFmpeg render job service — assembles stills + audio into the final MP4.
- **Video distribution:** YouTube Data API v3, Vimeo API (pull upload), Dailymotion API (password grant), Rumble (manual link).
- **UI:** Tailwind CSS, shadcn/ui components, framer-motion, recharts.

## System diagram

```
                              ┌──────────────────────────────────────┐
                              │              User (browser)            │
                              └───────────────────┬────────────────────┘
                                                  │ HTTPS
                                                  ▼
                        ┌──────────────────────────────────────────────┐
                        │            Next.js App (App Router)            │
                        │   pages + server components + /api routes      │
                        │   NextAuth (credentials, JWT, allowlist)       │
                        └───┬───────┬───────┬───────┬───────┬───────┬────┘
                            │       │       │       │       │       │
              ┌─────────────┘       │       │       │       │       └──────────────┐
              ▼                     ▼       ▼       ▼       ▼                      ▼
      ┌───────────────┐   ┌──────────────┐ ┌──────────┐ ┌───────────┐   ┌───────────────────┐
      │ Prisma        │   │ AWS S3       │ │ OpenAI   │ │ AbacusAI  │   │ Video platforms:  │
      │ → PostgreSQL  │   │ (assets)     │ │ tts-1    │ │ LLM +     │   │ YouTube / Vimeo / │
      │               │   │              │ │          │ │ image gen │   │ Dailymotion /     │
      │               │   │              │ │          │ │           │   │ Rumble (manual)   │
      └───────────────┘   └──────────────┘ └──────────┘ └───────────┘   └───────────────────┘
                                  ▲
                                  │ public asset URLs
                          ┌───────┴────────┐
                          │ FFmpeg render  │
                          │ job service    │
                          └────────────────┘
```

## Page / component map (`app/(dashboard)/`)

| Route | Page | Purpose |
|-------|------|---------|
| `/` | `page.tsx` → `dashboard-client.tsx` | Overview: budget pie, income timeline, stream cards. |
| `/youtube-studio` | `youtube-studio/page.tsx` → `studio-client.tsx` | Faceless-video pipeline, distribution, monetization tracker. |
| `/content-factory` | `content-factory/page.tsx` | AI script generator + content calendar. |
| `/affiliate-hub` | `affiliate-hub/page.tsx` | Programs, niche-site planner, brief generator, income calculator. |
| `/arbitrage` | `arbitrage/page.tsx` | Crypto / sports / retail arbitrage tools. |
| `/print-on-demand` | `print-on-demand/page.tsx` | POD design ideas + profit calculator. |
| `/simulator` | `simulator/page.tsx` | Monte Carlo income simulator. |
| `/settings` | `settings/page.tsx` | $500 budget allocation + per-stream settings. |

Shared UI lives in `app/(dashboard)/_components/` (sidebar, stat-card, charts, stream-output, copy-button). Auth UI: `app/login/`, `components/auth-form.tsx`, `components/providers.tsx`.

YouTube Studio components: `studio-client.tsx`, `video-panel.tsx`, `distribution-section.tsx`, `monetization-tracker.tsx`, `pipeline.ts` (API client).

Key libs: `lib/videos.ts`, `lib/distribution.ts`, `lib/media-ai.ts`, `lib/youtube.ts`, `lib/s3.ts`, `lib/db.ts`, `lib/api-auth.ts`, `lib/access.ts`, `lib/video-launch-plan.ts`.

## Data flow — video production pipeline

```
Plan (fact sheet)  →  Script (AbacusAI, SSE)  →  Visuals (per-scene + thumbnail image gen)
   →  Voiceover (OpenAI tts-1, per scene)  →  Render (FFmpeg: stills timed to audio → MP4 on S3)
   →  Publish (YouTube Data API v3)  →  Distribute (Vimeo / Dailymotion auto, Rumble manual)
   →  Monetize (track PlatformProgress vs. program thresholds)
```

Each stage advances `VideoProject.status` (planned → scripted → visuals → voiced → rendered → published) and edits upstream (e.g. changing narration) invalidate downstream assets so they regenerate.
