# API Routes Reference

Documented from the route files under `app/api/`. All routes are `export const dynamic = 'force-dynamic'`.

**Auth:** Most routes call `requireAuth()` (returns HTTP 401 if no valid session). Exceptions are noted. Public/auth-flow routes: `/api/signup`, `/api/auth/login`, `/api/auth/[...nextauth]`, `/api/youtube/callback` (uses `auth()` directly).

---

## Video pipeline

### `GET /api/videos`
- **Auth:** required.
- **Response:** `{ videos: SerializedVideo[], integrations: { tts, youtubeConfigured, youtubeConnected, channelTitle, channelUrl, vimeo, dailymotion } }`.
- Seeds the launch slate via `ensureLaunchVideos()` on first call.

### `PATCH /api/videos/[id]`
- **Auth:** required.
- **Body:** `{ youtubeTitle?, description?, tags?: string[], scheduledFor?: string|null, sceneNarrations?: string[] }`.
- Editing a scene's narration clears that scene's voiceover + the render (must re-voice/re-render).
- **Response:** serialized video. `404` if not found.

### `POST /api/videos/[id]/script`
- **Auth:** required.
- **Body:** `{ notes?: string }` (max 1000 chars, producer notes).
- Streams **Server-Sent Events** while AbacusAI (`gpt-5.4`, JSON mode) writes the script. Events: `{status:'processing', chars}`, then `{status:'completed', result}` or `{status:'error', message}`.
- On success persists `script`, `youtubeTitle`, `description`, `tags` and resets downstream assets.

### `POST /api/videos/[id]/visuals`
- **Auth:** required.
- **Body:** `{ target: 'thumbnail' | <sceneIndex:number> }` — generates one image per call via `gemini-3.1-flash-image`, uploads to S3.
- **Response:** serialized video. `400` for invalid scene / missing script.

### `POST /api/videos/[id]/voiceover`
- **Auth:** required.
- **Body:** `{ sceneIndex: number }` — synthesizes narration via OpenAI `tts-1`, uploads WAV to S3, stores `{ path, duration }`.
- **Response:** serialized video.

### `POST /api/videos/[id]/render`
- **Auth:** required. `maxDuration = 300`.
- Requires script + every scene image + every scene voiceover. Builds an FFmpeg filter graph (one still per scene, timed to that scene's audio + 0.4s gap) and starts the job. Also auto-writes YouTube chapters into the description.
- **Response:** serialized video (with `renderRequestId`). `400` if assets missing.

### `GET /api/videos/[id]/render`
- **Auth:** required.
- Polls the FFmpeg job once; on `SUCCESS` stores `videoUrl`, on `FAILED` stores `lastError`.
- **Response:** serialized video.

### `POST /api/videos/[id]/publish`
- **Auth:** required.
- **Body:** `{ privacyStatus: 'private'|'unlisted'|'public', useSchedule: boolean }`.
- Uploads the rendered MP4 + thumbnail to YouTube; supports scheduled publish (>15 min ahead). Stores `youtubeVideoId`, `publishedAt`.
- **Response:** serialized video. `400` if not rendered / already published.

### `POST /api/videos/[id]/distribute`
- **Auth:** required. `maxDuration = 300`.
- **Body:** `{ platform: 'vimeo'|'dailymotion'|'rumble', privacy?: 'public'|'unlisted'|'private', url?: string, remove?: boolean }`.
- Vimeo/Dailymotion upload automatically (requires rendered `videoUrl` + configured creds); Rumble records a manually pasted `rumble.com` link. `remove:true` deletes a platform entry.
- Updates the `distribution` JSON field. **Response:** serialized video.

---

## Monetization

### `GET /api/monetization`
- **Auth:** required.
- **Response:** `{ programs: (MonetizationProgram & { progress: {followers, views, watchHours, status, notes} })[] }` for all 6 platforms.

### `PATCH /api/monetization`
- **Auth:** required.
- **Body:** `{ platform, followers?, views?, watchHours?, status?, notes? }` — upserts a `PlatformProgress` row (numbers coerced/validated, status must be a known value).
- **Response:** `{ programs: [...] }`.

---

## YouTube OAuth

### `GET /api/youtube/connect`
- **Auth:** required. Redirects to Google OAuth consent (`access_type=offline`, `prompt=consent`, YouTube scopes). Sets an httpOnly `yt_oauth_state` cookie. `400` if creds not configured.

### `DELETE /api/youtube/connect`
- **Auth:** required. Deletes the singleton `YouTubeConnection`. **Response:** `{ ok: true }`.

### `GET /api/youtube/callback`
- **Auth:** uses `auth()` directly (redirect-based, no `requireAuth`).
- Validates `state` against the cookie, exchanges the code, requires a `refresh_token`, fetches channel info, upserts `YouTubeConnection`, then redirects to `/youtube-studio?youtube=<result>`.

---

## Finance / dashboard

### `GET /api/budget` · `PUT /api/budget`
- **Auth:** required. Read/save `BudgetAllocation` rows (the $500 seed budget split).

### `GET /api/income` · `PUT /api/income`
- **Auth:** required. Read/save `IncomeEntry` rows (projected vs. actual).

### `GET /api/content-calendar` · `POST /api/content-calendar` · `PATCH /api/content-calendar`
- **Auth:** required. List calendar items; create items; patch an item's status.

### `GET /api/stream-settings` · `PUT /api/stream-settings`
- **Auth:** required. Read/save `StreamSettings` per stream.

### `POST /api/simulator`
- **Auth:** required. Runs a Monte Carlo income projection from optimistic/realistic/pessimistic parameters; returns percentile bands over time.

### `GET /api/crypto/prices`
- **Auth:** required. Returns live crypto market data for the arbitrage scanner.

---

## AI generation (streamed unless noted)

All require auth. Use AbacusAI LLM completions.

| Route | Body | Notes |
|-------|------|-------|
| `POST /api/generate/script` | `{ niche, platform, videoLength }` | Streams a short-form video script. |
| `POST /api/generate/brief` | `{ niche, topic }` | Streams an SEO content brief. |
| `POST /api/generate/calendar` | `{ niche, platform }` | Returns a 30-day calendar as JSON. |
| `POST /api/generate/designs` | `{ niche, occasion }` | Streams print-on-demand design ideas. |
| `POST /api/generate/niche-site` | `{ niche }` | Streams a niche affiliate site structure. |

---

## Auth

### `POST /api/signup`
- **Public.** Body `{ email, password, name? }`. Hashes password (bcrypt) and creates the user. Allowlist enforced (unauthorized emails stored but cannot sign in).

### `POST /api/auth/login`
- **Public.** Body `{ email, password }`. Server-side allowlist + bcrypt check before the Auth.js `signIn` flow. `403` if email not authorized.

### `GET|POST /api/auth/[...nextauth]`
- **Public.** Re-exports NextAuth `handlers` (session, callback, sign-in/out endpoints).
