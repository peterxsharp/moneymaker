# Prisma Schema Reference

Documented directly from `prisma/schema.prisma`.

## Generator & datasource

```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "linux-musl-arm64-openssl-3.0.x"]
  output        = "node_modules/.prisma/client"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

- **ORM:** Prisma Client (JS).
- **Database:** PostgreSQL, connection string from `DATABASE_URL`.
- **binaryTargets** include an ARM musl target for the hosted runtime.

---

## Models

### `BudgetAllocation`
Stores the allocation of the $500 seed budget across income streams.

| Field | Type | Attributes |
|-------|------|-----------|
| id | String | `@id @default(cuid())` |
| stream | String | `@unique` |
| amount | Float | `@default(0)` |
| label | String | |
| color | String | `@default("#10B981")` |
| createdAt | DateTime | `@default(now())` |
| updatedAt | DateTime | `@updatedAt` |

### `IncomeEntry`
Monthly projected vs. actual income per stream.

| Field | Type | Attributes |
|-------|------|-----------|
| id | String | `@id @default(cuid())` |
| stream | String | |
| month | Int | |
| year | Int | |
| projected | Float | `@default(0)` |
| actual | Float | `@default(0)` |
| createdAt | DateTime | `@default(now())` |
| updatedAt | DateTime | `@updatedAt` |

Constraint: `@@unique([stream, month, year])`.

### `ContentCalendarItem`
A scheduled content item on the content calendar.

| Field | Type | Attributes |
|-------|------|-----------|
| id | String | `@id @default(cuid())` |
| day | Int | |
| date | DateTime | |
| platform | String | |
| niche | String | |
| title | String | |
| description | String | `@default("")` |
| status | String | `@default("pending")` |
| createdAt | DateTime | `@default(now())` |
| updatedAt | DateTime | `@updatedAt` |

### `StreamSettings`
Per-stream configuration for the simulator and settings pages.

| Field | Type | Attributes |
|-------|------|-----------|
| id | String | `@id @default(cuid())` |
| stream | String | `@unique` |
| automationScore | Int | `@default(0)` |
| hoursPerWeek | Float | `@default(0)` |
| isActive | Boolean | `@default(true)` |
| optimistic | Float | `@default(0)` |
| realistic | Float | `@default(0)` |
| pessimistic | Float | `@default(0)` |
| createdAt | DateTime | `@default(now())` |
| updatedAt | DateTime | `@updatedAt` |

### `User`
Application user (credentials-based auth). Backed by NextAuth PrismaAdapter.

| Field | Type | Attributes |
|-------|------|-----------|
| id | String | `@id @default(cuid())` |
| name | String? | |
| email | String? | `@unique` |
| emailVerified | DateTime? | |
| image | String? | |
| password | String? | (bcrypt hash) |
| role | String | `@default("user")` |
| accounts | Account[] | relation |
| sessions | Session[] | relation |
| createdAt | DateTime | `@default(now())` |
| updatedAt | DateTime | `@updatedAt` |

### `Account`
NextAuth OAuth/account linkage (standard adapter model).

| Field | Type | Attributes |
|-------|------|-----------|
| id | String | `@id @default(cuid())` |
| userId | String | |
| type | String | |
| provider | String | |
| providerAccountId | String | |
| refresh_token | String? | `@db.Text` |
| access_token | String? | `@db.Text` |
| expires_at | Int? | |
| token_type | String? | |
| scope | String? | |
| id_token | String? | `@db.Text` |
| session_state | String? | |
| user | User | relation, `onDelete: Cascade` |

Constraint: `@@unique([provider, providerAccountId])`.

### `Session`
NextAuth session record.

| Field | Type | Attributes |
|-------|------|-----------|
| id | String | `@id @default(cuid())` |
| sessionToken | String | `@unique` |
| userId | String | |
| expires | DateTime | |
| user | User | relation, `onDelete: Cascade` |

### `VideoProject`
The core faceless-video production record for the YouTube Studio pipeline.

| Field | Type | Attributes |
|-------|------|-----------|
| id | String | `@id @default(cuid())` |
| slug | String | `@unique` |
| order | Int | `@default(0)` |
| topic | String | |
| angle | String | `@default("")` |
| factSheet | String | `@db.Text` |
| sources | String[] | `@default([])` |
| status | String | `@default("planned")` (planned → scripted → visuals → voiced → rendered → published) |
| script | Json? | full `VideoScript` object |
| youtubeTitle | String | `@default("")` |
| description | String | `@default("") @db.Text` |
| tags | String[] | `@default([])` |
| thumbnailPath | String? | S3 key |
| sceneImages | Json? | array of S3 keys per scene |
| voiceover | Json? | array of `{ path, duration }` per scene |
| renderRequestId | String? | FFmpeg job id |
| videoUrl | String? | rendered MP4 URL |
| youtubeVideoId | String? | set after publish |
| scheduledFor | DateTime? | |
| publishedAt | DateTime? | |
| lastError | String? | `@db.Text` |
| **distribution** | **Json?** | **cross-post metadata: vimeo/dailymotion/rumble entries (added this session)** |
| createdAt | DateTime | `@default(now())` |
| updatedAt | DateTime | `@updatedAt` |

### `PlatformProgress` (new this session)
Tracks monetization progress per creator platform.

| Field | Type | Attributes |
|-------|------|-----------|
| platform | String | `@id` (e.g. youtube, dailymotion, rumble, vimeo, tiktok, instagram) |
| followers | Int | `@default(0)` |
| views | Int | `@default(0)` |
| watchHours | Float | `@default(0)` |
| status | String | `@default("not_started")` (not_started/building/eligible/applied/monetized) |
| notes | String | `@default("") @db.Text` |
| updatedAt | DateTime | `@updatedAt` |

### `YouTubeConnection`
Stores the single channel-owner OAuth refresh token + channel info.

| Field | Type | Attributes |
|-------|------|-----------|
| id | String | `@id @default("default")` (singleton) |
| refreshToken | String | `@db.Text` |
| channelId | String | `@default("")` |
| channelTitle | String | `@default("")` |
| createdAt | DateTime | `@default(now())` |
| updatedAt | DateTime | `@updatedAt` |

### `VerificationToken`
Standard NextAuth verification token model.

| Field | Type | Attributes |
|-------|------|-----------|
| identifier | String | |
| token | String | `@unique` |
| expires | DateTime | |

Constraint: `@@unique([identifier, token])`.

---

## Enums

The schema uses **no Prisma `enum` types**. Status-like values are stored as `String` with app-level constants:
- `VideoProject.status`: planned, scripted, visuals, voiced, rendered, published (see `PIPELINE_STAGES` in `lib/video-launch-plan.ts`).
- `PlatformProgress.status`: not_started, building, eligible, applied, monetized (see `PROGRESS_STATUSES` in `lib/distribution.ts`).
