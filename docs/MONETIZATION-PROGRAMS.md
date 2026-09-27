# Monetization Programs

Requirements for all 6 platforms tracked by the app. Sourced from `lib/distribution.ts` (`MONETIZATION_PROGRAMS`, researched Sep 2026). **Always verify current requirements on each platform — programs change often.**

Progress statuses tracked per platform: `not_started → building → eligible → applied → monetized`.

---

## 1. YouTube — YouTube Partner Program
- **Requirements:** 1,000 subscribers **and** 4,000 public watch hours in the last 12 months (**or** 10M Shorts views in 90 days).
- **Early access (fan funding tier):** 500 subs, 3 uploads in 90 days, 3,000 watch hours.
- **Targets tracked:** 1,000 followers, 4,000 watch hours.
- **Apply:** https://studio.youtube.com/
- **Primary revenue:** AdSense (ad revenue share) + fan funding.

## 2. Vimeo — Vimeo On Demand / OTT
- **Requirements:** No ad-revenue sharing on Vimeo. Earn by **selling or renting** videos, which requires a **paid Vimeo plan**. Best used as a clean, ad-free portfolio / embed host.
- **Targets tracked:** none (subscription/sales-based).
- **Apply:** https://vimeo.com/ondemand
- **Role in this project:** cross-post destination for distribution + ad-free embeds.

## 3. Dailymotion — Dailymotion Partner Program
- **Requirements:** 1,000 cumulative views (monetization then auto-enables); 18+, own all rights, account in good standing; **$100 minimum payout**.
- **Targets tracked:** 1,000 views.
- **Apply:** https://www.dailymotion.com/partner
- **Role:** automated cross-post via password-grant OAuth upload.

## 4. Rumble — Rumble Partner Program (video licensing)
- **Requirements:** No follower/view minimum. Choose a license on upload — pick **"Rumble Only"** or **"Excluding YouTube"** so YouTube monetization is unaffected. The Creator Program (live streaming) needs 100 followers + Premium.
- **Targets tracked:** none.
- **Apply:** https://rumble.com/account/dashboard
- **Note:** **No public upload API — manual upload only.** The app provides a "Rumble kit" (MP4 + title/description/tags) and records the posted URL.

## 5. TikTok — Creator Rewards Program *(Phase 2)*
- **Requirements:** 18+, **10,000 followers**, **100,000 views in the last 30 days**, videos over 1 minute.
- **Targets tracked:** 10,000 followers, 100,000 views.
- **Apply:** https://www.tiktok.com/creators
- **Status:** deferred to Phase 2 (no integration yet).

## 6. Instagram — Gifts / Subscriptions / Ads on Reels *(Phase 2)*
- **Requirements:** Professional (Creator/Business) account, 18+. **Gifts:** 500 followers. **Subscriptions & Ads on Reels:** 10,000 followers (+600k minutes viewed in 60 days for ads).
- **Targets tracked:** 10,000 followers.
- **Apply:** https://www.instagram.com/accounts/professional_dashboard/
- **Status:** deferred to Phase 2 (invite/threshold gated, no integration yet).

---

### Summary table

| Platform | Program | Key thresholds | API integration | Phase |
|----------|---------|----------------|-----------------|-------|
| YouTube | Partner Program | 1,000 subs + 4,000 watch hrs (or 10M Shorts views) | Data API v3 (auto publish) | 1 |
| Vimeo | On Demand / OTT | Paid plan; sell/rent | Pull-upload API (auto) | 1 |
| Dailymotion | Partner Program | 1,000 views; $100 payout | Password-grant API (auto) | 1 |
| Rumble | Video licensing | None; license choice | Manual only (kit + link) | 1 |
| TikTok | Creator Rewards | 10K followers + 100K views/30d | — | 2 |
| Instagram | Gifts/Subs/Reels ads | 500–10K followers | — | 2 |
