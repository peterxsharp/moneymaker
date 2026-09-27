# Pharaoh's Edge Blog — Deployment & Affiliate Monetization Guide

## Part 1: Deploy the Blog to pharaohsedge.online/blog

The blog package contains 5 complete, dark-themed HTML articles + a blog index page styled to match your Command Center. Here are the 3 deployment paths, from easiest to most control.

---

### 🥇 Option A: Cloudflare Pages (Recommended — 10 minutes)

Cloudflare Pages is **free**, **instant CDN globally**, and integrates directly with your existing Cloudflare account (you're already on Cloudflare based on the server headers).

**Steps:**

1. **Go to** https://dash.cloudflare.com → **Pages** → **Create a project**

2. **Choose "Direct Upload"** (no GitHub needed)

3. **Upload the `pharaohs-edge-blog.zip`** file (attached below)
   - Cloudflare will auto-extract it and deploy

4. **Your blog will be live** at something like `pharaohs-edge-blog.pages.dev`

5. **Route `/blog` from your main domain:**
   - Go to **Cloudflare Dashboard** → **Workers & Pages** → your pharaohsedge.online zone
   - Go to **Rules** → **Page Rules** → **Create Page Rule**
   - URL: `pharaohsedge.online/blog*`
   - Setting: **Forwarding URL** (301) → `https://pharaohs-edge-blog.pages.dev/blog$1`
   
   **OR** (better) use a **Cloudflare Worker** to proxy the blog seamlessly:

```javascript
// Cloudflare Worker — paste at dash.cloudflare.com → Workers → Create
// Route: pharaohsedge.online/blog*

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/blog')) {
      const targetUrl = 'https://pharaohs-edge-blog.pages.dev' + url.pathname + url.search;
      return fetch(targetUrl, request);
    }
    return fetch(request);
  }
};
```

   - Create the worker at https://dash.cloudflare.com → **Workers** → **Create Worker**
   - Paste the code above, save it
   - Add a **Route**: `pharaohsedge.online/blog*` → your worker name
   - Now `pharaohsedge.online/blog` serves the blog seamlessly ✅

---

### 🥈 Option B: Netlify Drop (5 minutes, no account needed)

1. Go to https://app.netlify.com/drop
2. Drag the `pharaohs-edge-blog.zip` onto the page
3. Netlify gives you an instant public URL like `random-name.netlify.app`
4. Use the Cloudflare Worker above to route `/blog` there

---

### 🥉 Option C: Add Blog Pages Directly to Your Abacus AI App

Since pharaohsedge.online is an Abacus AI app:
1. Open your app in the Abacus AI App Builder
2. Add new pages for `/blog`, `/blog/posts/[slug]`
3. Paste the HTML content from each file into the page editor
4. Publish — the blog becomes a native part of your Next.js app

---

## Part 2: Replace Placeholder Affiliate Links

Every `href="#"` in the blog posts is a placeholder. Here's exactly what to replace them with after joining each program:

| Placeholder | Replace With | Program URL |
|-------------|-------------|-------------|
| Monday.com CTA buttons | Your Monday.com affiliate tracking URL | https://monday.com/affiliates |
| Ahrefs CTA buttons | Your Ahrefs affiliate tracking URL | https://ahrefs.com/affiliate-program |
| Semrush CTA buttons | Your Semrush affiliate tracking URL | https://www.semrush.com/partner/affiliate/ |
| Copy.ai CTA buttons | Your Copy.ai affiliate tracking URL | https://www.copy.ai/affiliates |
| Jasper AI CTA buttons | Your Jasper affiliate tracking URL | https://www.jasper.ai/affiliate-program |
| Amazon product links | Your Amazon Associates tracked links | https://affiliate-program.amazon.com |
| Notion CTA buttons | Your Notion affiliate tracking URL | https://www.notion.so/affiliate-program |

**How to find your affiliate link:** After approval, each program gives you a dashboard where you generate tracking URLs. Copy the URL from your dashboard and replace the `href="#"` in the HTML files.

---

## Part 3: Step-by-Step Affiliate Program Setup

### Step 1: Apply to the Highest-Commission Programs First

Priority order by potential earnings:

| # | Program | Commission | Apply URL | Approval Time |
|---|---------|-----------|-----------|--------------|
| 1 | **Monday.com** | Up to **$1,080/sale** | https://monday.com/affiliates | 3-5 days |
| 2 | **Ahrefs** | **$1,000/referral** | https://ahrefs.com/affiliate-program | 7-14 days |
| 3 | **Semrush** | **$200/sale + 40% recurring** | https://www.semrush.com/partner/affiliate/ | 3-5 days |
| 4 | **Copy.ai** | **45% recurring (Year 1)** | https://www.copy.ai/affiliates | 1-2 days |
| 5 | **Jasper AI** | **30% recurring** | https://www.jasper.ai/affiliate-program | 3-5 days |
| 6 | **Amazon Associates** | 4-8% per sale | https://affiliate-program.amazon.com | Instant |
| 7 | **Notion** | Per referred user | https://www.notion.so/affiliate-program | 7 days |

### Step 2: Network to Join (Where Direct Programs Don't Exist)

Some tools use affiliate networks. Sign up at:
- **PartnerStack** (https://partnerstack.com) — covers Notion, Surfer SEO, many SaaS tools
- **Impact** (https://impact.com) — covers many tech tools
- **ShareASale** (https://shareasale.com) — broad coverage

### Step 3: After Approval — Add Links to the Blog

For each approved program:

1. Log into the affiliate dashboard
2. Generate your **tracking link** for the product's homepage (or the specific pricing page)
3. Open the relevant HTML file in a text editor
4. Find all instances of `href="#"` within the relevant `<div class="affiliate-callout">` or `<div class="affiliate-card">`
5. Replace `href="#"` with `href="YOUR_TRACKING_URL"`
6. Re-upload the updated file to Cloudflare Pages

**Pro tip:** Use UTM parameters to track which blog post/button drives conversions:
```
https://your-affiliate-link.com?utm_source=pharaohsedge&utm_medium=blog&utm_campaign=semrush-review
```

### Step 4: Add Your Affiliate Disclosure

The footer already contains: *"Affiliate disclosure: Some links on this blog earn us a commission at no extra cost to you."*

This is required by the FTC (US) and ASA (UK). ✅ Already done.

### Step 5: Track Performance

Set up Google Analytics 4 on the blog to track:
- Which posts drive the most traffic
- Which CTA buttons get clicked
- Conversion path to affiliate programs

Add before `</head>` in every HTML file:
```html
<!-- Replace G-XXXXXXXXXX with your GA4 Measurement ID -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## Part 4: Revenue Projections

Based on typical affiliate blog performance for a niche tech site:

| Month | Traffic (Organic) | Conversions | Est. Revenue |
|-------|-----------------|-------------|-------------|
| 1-3 | 50-200/month | 0-2 | $0-$400 |
| 4-6 | 500-1,000/month | 2-8 | $500-$3,000 |
| 7-12 | 2,000-5,000/month | 8-30 | $3,000-$15,000 |
| 12+ | 10,000+/month | 50+ | $10,000-$50,000+ |

**Fastest path to first commission:** The Monday.com post or Semrush comparison — these have buyer-intent keywords and the highest ticket value. One Monday.com Enterprise conversion = $1,080 in one shot.

---

## Part 5: SEO Checklist for Each Post

Complete these steps to maximize organic reach:

- [ ] Submit `pharaohsedge.online/blog` to Google Search Console
- [ ] Create a `sitemap.xml` listing all blog URLs (template below)
- [ ] Submit sitemap to GSC at Search Console → Sitemaps
- [ ] Set up Google Analytics 4 (tracking code above)
- [ ] Share each post on LinkedIn, Twitter/X with relevant hashtags
- [ ] Build 2-3 backlinks per post (post in relevant Reddit communities, Quora answers)
- [ ] Update posts every 6 months to maintain freshness signals

### Sitemap Template (save as `/blog/sitemap.xml`)

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://pharaohsedge.online/blog/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>https://pharaohsedge.online/blog/posts/cursor-vs-github-copilot-vs-claude-code-2026.html</loc><lastmod>2026-09-27</lastmod><priority>0.9</priority></url>
  <url><loc>https://pharaohsedge.online/blog/posts/best-ai-writing-tools-2026.html</loc><lastmod>2026-09-23</lastmod><priority>0.9</priority></url>
  <url><loc>https://pharaohsedge.online/blog/posts/semrush-vs-ahrefs-vs-moz-2026.html</loc><lastmod>2026-09-20</lastmod><priority>0.9</priority></url>
  <url><loc>https://pharaohsedge.online/blog/posts/top-productivity-apps-2026.html</loc><lastmod>2026-09-18</lastmod><priority>0.8</priority></url>
  <url><loc>https://pharaohsedge.online/blog/posts/best-mechanical-keyboards-programmers-2026.html</loc><lastmod>2026-09-15</lastmod><priority>0.8</priority></url>
</urlset>
```

---

## Summary

| Done | Task |
|------|------|
| ✅ | 5 SEO-optimized blog articles written and ready |
| ✅ | Dark-themed blog design matching pharaohsedge.online |
| ✅ | Affiliate callout boxes embedded in every post |
| ✅ | FAQ sections for featured snippet capture |
| ✅ | Blog index page with sidebar affiliate widgets |
| ⬜ | Deploy to Cloudflare Pages (your action — 10 min) |
| ⬜ | Configure Cloudflare Worker to route /blog (your action — 5 min) |
| ⬜ | Apply to affiliate programs (your action — start with Monday.com, Ahrefs, Semrush) |
| ⬜ | Replace `href="#"` with real affiliate tracking URLs |
| ⬜ | Add Google Analytics 4 tracking code |
| ⬜ | Submit sitemap.xml to Google Search Console |

*Generated by Pharaoh's Edge SEO Agent · 2026-09-27*
