# Pharaoh's Edge — Moneymaker

Passive income automation hub. This repo tracks all content, strategy, and code for the Pharaoh's Edge blog and affiliate pipeline.

## Live Site
- **Command Center:** https://pharaohsedge.online
- **Blog (Cloudflare Worker):** https://delicate-wildflower-5bef.pharaohsedge.workers.dev

## Repo Structure

```
moneymaker/
├── blog/
│   ├── index.html                    # Blog index page (v2 — clean URLs)
│   ├── css/style.css                 # Dark-theme stylesheet
│   ├── posts/                        # All 5 SEO articles (v2 — current)
│   │   ├── cursor-vs-github-copilot-vs-claude-code-2026.html
│   │   ├── best-ai-writing-tools-2026.html
│   │   ├── semrush-vs-ahrefs-vs-moz-2026.html
│   │   ├── top-productivity-apps-2026.html
│   │   └── best-mechanical-keyboards-programmers-2026.html
│   ├── pharaohs-edge-blog-v2.zip     # Deployable zip (v2 — clean URLs + fixed imgs)
│   └── v1-original/
│       ├── pharaohs-edge-blog-v1.zip         # Original zip (v1 — .html links)
│       └── blog_post_content-first-draft.html # Raw first draft before publishing
│
├── seo-reports/
│   └── seo_weekly_report_2026-09-27.md  # Week 1 SEO performance report
│
└── strategy/
    └── deploy-and-monetize-guide.md      # Cloudflare deploy steps + affiliate setup
```

## Blog Posts (5 Articles Published)

| Article | Category | Primary Keyword | Top Affiliate |
|---------|----------|-----------------|---------------|
| Cursor vs GitHub Copilot vs Claude Code | AI Tools | best AI coding assistant 2026 | Monday.com ($1,080/sale) |
| 7 Best AI Writing Tools in 2026 | AI Tools | best AI writing tools 2026 | Copy.ai (45% recurring) |
| Semrush vs Ahrefs vs Moz | Software | best SEO tool 2026 | Ahrefs ($1,000/referral) |
| Top 10 Productivity Apps 2026 | Productivity | productivity apps save time | Monday.com ($1,080/sale) |
| Best Mechanical Keyboards for Programmers | Gadgets | best mechanical keyboard programmers | Amazon Associates |

## Affiliate Programs to Join

| Program | Commission | Apply |
|---------|-----------|-------|
| Monday.com | Up to $1,080/sale | https://monday.com/affiliates |
| Ahrefs | $1,000/referral | https://ahrefs.com/affiliate-program |
| Semrush | $200/sale + 40% recurring | https://www.semrush.com/partner/affiliate/ |
| Copy.ai | 45% recurring (Year 1) | https://www.copy.ai/affiliates |
| Jasper AI | 30% recurring | https://www.jasper.ai/affiliate-program |
| Amazon Associates | 4–8% | https://affiliate-program.amazon.com |

## Deploy to pharaohsedge.online/blog

1. Upload `blog/pharaohs-edge-blog-v2.zip` to **Cloudflare Pages** (Direct Upload)
2. Route `pharaohsedge.online/blog*` via Cloudflare Worker to the Pages deployment
3. See `strategy/deploy-and-monetize-guide.md` for full step-by-step

## Version History

| Version | Date | Changes |
|---------|------|---------|
| v1 | 2026-09-27 | Initial 5-article build, `.html` extension links |
| v2 | 2026-09-27 | Clean URLs (no `.html`), fixed mechanical keyboard image |
