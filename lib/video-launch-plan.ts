// Launch slate for the TechAssist-Edge YouTube channel.
// Fact sheets were researched on 2026-09-27 and are injected verbatim into
// script generation so the model stays on verified facts.

export const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@TechAssist-Edge'
export const CHANNEL_NAME = 'TechAssist Edge'
export const LAUNCH_DATE_ISO = '2026-10-05T16:00:00.000Z'

export interface LaunchVideo {
  slug: string
  order: number
  topic: string
  angle: string
  factSheet: string
  sources: string[]
}

export const LAUNCH_VIDEOS: LaunchVideo[] = [
  {
    slug: 'ram-pricing-crisis-2026',
    order: 1,
    topic: 'RAM Pricing in 2026',
    angle: 'Why DDR5 and DDR4 cost so much right now, what is driving it, and whether to buy now or wait.',
    factSheet: `- Late Sept 2026: DRAM prices are at or near record highs, driven by AI/data-center demand outpacing fab capacity.
- 32GB (2x16GB) DDR5-6000 retail kits typically $429–$604; median ≈ $17.50–$17.97 per GB.
- DDR4 ≈ $7.77–$7.81 per GB (about 56% cheaper than DDR5), but supply is squeezed as makers wind down DDR4 production.
- DDR4 1Gx8 3200 chip hit a record spot price of $46.11 on Sept 24, 2026.
- Price trackers show DDR4 and DDR5 at the top of their recent two-month ranges.
- HBM contract pricing: HBM3E ≈ $12.00–$12.80/GB; HBM4 estimated ≈ $16/GB.
- Analysts (Gartner, Counterpoint, TrendForce) do not expect meaningful relief before late 2027; contract prices expected to keep rising through 2026.
- Practical advice: buy what you need now, don't wait for a crash; consider 32GB DDR5 as the sweet spot; DDR4 platforms only if reusing parts.`,
    sources: ['https://capitalandcompute.net/memory-prices/', 'https://www.tomshardware.com/pc-components/ram/ram-price-index-2026-lowest-price-on-ddr5-and-ddr4-memory-of-all-capacities', 'https://rampricesusa.com/ram-price-trends'],
  },
  {
    slug: 'best-mid-range-gpus-2026',
    order: 2,
    topic: 'Choosing a Mid-Range Graphics Card',
    angle: 'The smart buyer’s guide to the $249–$429 GPU bracket and the 8GB VRAM trap.',
    factSheet: `- 2026 mid-range bracket ≈ $249–$429; rivalry between Nvidia RTX 50-series and AMD RX 9000-series (RDNA 4).
- “VRAM cliff”: 8GB cards stutter in modern titles, especially with frame generation; 16GB is favored for 1440p longevity.
- AMD Radeon RX 9060 XT 16GB — $349: widely cited best value; ~16% faster than RTX 5060 Ti 8GB at 1440p while costing less; strong efficiency (good for ITX).
- Nvidia GeForce RTX 5060 Ti 16GB — $429: best all-rounder if you want DLSS 4 Multi-Frame Generation, better ray tracing and CUDA for creative apps.
- Intel Arc B580 — $249, 12GB: best budget 1440p pick; performs best on PCIe 4.0+ systems.
- Avoid 8GB cards for 1440p Ultra.
- Memory/silicon demand from AI may push future GPU pricing up; current 16GB mid-range pricing is relatively stable.`,
    sources: ['https://www.switchbladegaming.com/game-settings/best-mid-range-gpu-2026/', 'https://www.newegg.com/insider/rtx-5000-vs-rx-9000-series-which-gpu-should-you-buy-in-2026/', 'https://www.techspot.com/bestof/gpu-25-26/'],
  },
  {
    slug: 'amd-ryzen-ai-halo-box',
    order: 3,
    topic: 'AMD Ryzen AI Halo — The Local AI Box',
    angle: 'Can a $3,999 mini PC with 128GB unified memory replace the cloud for running your own AI models?',
    factSheet: `- AMD Ryzen AI Halo: AI mini-workstation built on Strix Halo — Ryzen AI Max+ 395 (Zen 5 CPU, Radeon 8060S iGPU with 40 RDNA 3.5 CUs, XDNA 2 NPU ≈ 50 TOPS).
- 128GB unified LPDDR5x-8000 on a 256-bit bus ≈ 256 GB/s bandwidth; GPU can address large models directly.
- Launched in the US at $3,999.
- Performance is bandwidth-bound: MoE models run well (≈25–45 tokens/s for 27B–35B-class; some coder MoE ≈100 tokens/s); dense 70B ≈ 4–9 tokens/s.
- Software: ROCm and Vulkan/RADV; Ollama and llama.cpp are genuinely usable in 2026 but less plug-and-play than CUDA; Linux often gives best results.
- Vs Nvidia DGX Spark ($4,699, Linux-only, CUDA): Halo ≈ $700 cheaper and runs Windows 11 natively.
- Vs Mac Studio M4 Max ($1,999–$5,999): Mac has ≈546 GB/s bandwidth (faster tokens) but is locked to macOS/MLX.
- Vs RTX 5090 (32GB): far faster for image/video gen and small models, but can't hold 100GB+ models.
- Coming: Ryzen AI Max 400-series refresh expected; a Ryzen AI Max+ PRO 495 variant is expected to support up to 192GB.`,
    sources: ['https://www.tweaktown.com/news/112183/amds-ryzen-ai-halo-ai-mini-pc-launches-in-the-us-with-128gb-memory-and-a-dollars3999-price-tag/index.html', 'https://www.techpowerup.com/344790/amd-ryzen-ai-halo-more-than-a-mini-pc-an-ai-development-platform-challenging-nvidias-dgx-spark', 'https://www.compute-market.com/blog/amd-ryzen-ai-halo-review-2026'],
  },
  {
    slug: 'logitech-2026-keyboards-mice',
    order: 4,
    topic: 'Logitech’s Latest Keyboards & Mice',
    angle: 'Signature Comfort Plus, the new MX Keypad, and MX Master 4 — what’s worth buying for your desk setup.',
    factSheet: `- June 2026: Logitech Signature Comfort Plus series — mouse with a built-in sculpted palm cushion ($49.99) and keyboard combo with dual-foam wrist rest ($109.99).
- September 2026: Logitech MX Keypad — programmable macro keypad aimed at developers, nine customizable LCD-backlit keys, integrates with Logi Options+; $99.99. Derived from the MX Creative Console.
- MX Master 4 mouse launched in late 2025 and remains the flagship productivity mouse.
- No new “MX Keys” keyboard has been announced as of Sept 2026 (speculation only).
- FCC filings suggest minor MX Mechanical / MX Mechanical Mini revisions (likely incremental — keycaps/colors), no confirmed date.
- Do NOT claim unannounced products exist; frame MX Keys/MX Mechanical refresh as rumor.`,
    sources: ['https://www.techradar.com/pro/its-something-weve-never-done-before-logitechs-newest-flagship-mouse-and-keyboard-comes-with-something-you-might-never-expect-a-cushion', 'https://www.theregister.com/personal-tech/2026/09/16/logitech-releases-the-mx-keypad-to-keep-idle-fingers-busy/5296573', 'https://www.notebookcheck.net/New-Logitech-MX-Mechanical-and-MX-Mechanical-Mini-wireless-keyboards-spotted-before-release.1130181.0.html'],
  },
  {
    slug: 'samsung-galaxy-watch-ultra2',
    order: 5,
    topic: 'Samsung Galaxy Watch Ultra2',
    angle: 'The toughest, brightest Galaxy Watch yet — specs, new health features, and who should buy it.',
    factSheet: `- Announced July 22, 2026 (Galaxy Unpacked); released August 7, 2026.
- 47mm cushion design, 10.7mm thick (thinner than the original Ultra); grade 4 titanium frame, sapphire crystal.
- 1.52" Super AMOLED, 5,000 nits peak — a smartwatch record at launch.
- Snapdragon SW6100 Wear Elite (3nm), 2GB RAM, 64GB storage; Wear OS 7 with One UI Watch 9.
- 800 mAh silicon-carbon battery (+35% vs previous gen); 10W wireless charging, ~40% in about 30 minutes.
- Durability: IP69K, 10ATM, MIL-STD-810H; EN13319 dive certified with ascent/descent rate and decompression safety monitoring.
- Sensors: BioActive, body/water temperature, heart rate, SpO2, ECG.
- New features: Trail Run (live elevation, climb progress, cumulative ascent/descent), Nutrition Alert (hydration guidance from estimated sweat loss), Vitals / Heart Health Score.
- Connectivity: LTE (eSIM), Bluetooth 6.0, dual-band Wi-Fi, dual-frequency GPS (L1+L5).
- Do not state a price unless certain; tell viewers to check the link in the description.`,
    sources: ['https://www.gsmarena.com/samsung_galaxy_watch_ultra2-14805.php', 'https://news.samsung.com/us/samsung-galaxy-unpacked-july-2026-first-look-galaxy-watch-ultra2-galaxy-watch9/', 'https://www.androidcentral.com/wearables/samsung-galaxy-watch/samsung-galaxy-watch-ultra-2'],
  },
  {
    slug: 'abacus-ai-streamlined-workflows',
    order: 6,
    topic: 'Using Abacus AI to Build Streamlined Workflows',
    angle: 'A practical walkthrough: replacing a pile of AI subscriptions with one workspace and letting an agent do the busywork.',
    factSheet: `- Abacus AI is an all-in-one AI platform: ChatLLM (multi-model chat workspace) + an autonomous agent for multi-step execution.
- ChatLLM gives access to many frontier models (e.g. GPT-5.6, Claude Opus 4.8, Gemini 3.1 Pro) with intelligent routing that picks a model per task (coding, writing, research).
- Also supports image and video generation, document analysis, and presentations.
- The agent can plan and execute multi-step tasks: build dashboards and full-stack web apps, research synthesis, browser automation, scheduled tasks.
- 2026 additions reported: Abacus Claw (persistent agent layer for development workflows) and Abacus AI Desktop.
- Pricing (reported): Basic $10/mo with 20,000 compute credits; Pro $20/mo with 30,000 credits; enterprise custom.
- Honest caveats: credit-based billing can be hard to predict; advanced agent builds have a learning curve.
- Real example to feature: this channel’s own production pipeline — research, scripting, thumbnails and rendering were automated from a single dashboard built with Abacus AI.
- Workflow tips: start with one repeatable task, write a clear brief, let the agent build a tool, schedule it, review outputs weekly.`,
    sources: ['https://blog.abacus.ai/blog/2026/03/23/abacus-ai-review-chatllm-deepagent-pricing-2026/', 'https://aijourn.com/abacus-ai-review-2026-the-unified-ai-platform-powering-chatllm-deepagent-and-enterprise-automation/', 'https://aitrendtool.com/tools/abacus-ai'],
  },
  {
    slug: 'nvidia-vera-rubin-platform',
    order: 7,
    topic: 'Nvidia Vera Rubin Explained',
    angle: 'Seven chips, one AI supercomputer — what Vera Rubin is and why it matters even if you never buy one.',
    factSheet: `- Announced at CES 2026; named after astronomer Vera Rubin. Now in full production; partner availability from 2H 2026.
- Seven-chip codesign: Vera CPU, Rubin GPU, NVLink 6 Switch, ConnectX-9 SuperNIC, BlueField-4 DPU, Spectrum-6 Ethernet switch (co-packaged optics), and Groq 3 LPU (low-latency inference).
- Vera CPU: 88 custom Olympus Arm cores (Armv9.2), Spatial Multithreading.
- Rubin GPU: 224 SMs, HBM4, 3rd-gen Transformer Engine, 50 petaflops NVFP4.
- NVLink 6: 3.6 TB/s per GPU.
- Claims vs Blackwell: ~90% lower cost per inference token; 75% fewer GPUs to train large MoE models.
- Inference Context Memory Storage Platform (BlueField-4) for KV-cache sharing — up to 5x inference throughput.
- Vera Rubin NVL72 rack: 72 Rubin GPUs + 36 Vera CPUs.
- Cloud partners: AWS, Google Cloud, Microsoft Azure, Oracle; plus CoreWeave, Lambda, Nebius.
- Why it matters to viewers: cheaper tokens → cheaper/faster AI apps; also explains why RAM/HBM demand is squeezing consumer memory prices.`,
    sources: ['https://nvidianews.nvidia.com/news/rubin-platform-ai-supercomputer', 'https://developer.nvidia.com/blog/inside-the-nvidia-rubin-platform-six-new-chips-one-ai-supercomputer/', 'https://nvidianews.nvidia.com/news/vera-rubin-full-production-agentic-ai-factory'],
  },
  {
    slug: 'spacex-starlink-plans-2026',
    order: 8,
    topic: 'SpaceX & Starlink Offerings in 2026',
    angle: 'Every Starlink plan decoded — home, roam, mobile, aviation — plus what V3 satellites and Starship change.',
    factSheet: `- Residential tiers ≈ $55, $85 and $130/month depending on speed/priority; Standard 4 kit (Mini Router on entry plan) and Standard 4 X kit (Gen 3 router). Regional promos have included a $39/mo plan (through March 2026) and free equipment rental.
- Starlink Roam (Starlink Mini dish): $55/mo for 100GB, $80/mo for 300GB, $175/mo unlimited; Standby Mode $10/mo.
- “Direct to Cell” rebranded as Starlink Mobile — satellite coverage layer when out of tower range; partners include Deutsche Telekom internationally.
- Aviation restructured: Aviation 300MPH $250/mo (20GB) and Aviation 450MPH $1,000/mo (20GB) for aircraft above the 100 mph Roam/Priority limit.
- Priority plans (business/maritime) use Starlink Performance Gen 3 dish; e.g. 1TB for $290/mo.
- V3 satellites: ~10x downlink capacity of V2, to be launched on Starship.
- SpaceX plans small terrestrial stations using dish tech to boost direct-to-device performance.
- Prices vary by region and change often — tell viewers to verify at starlink.com.`,
    sources: ['https://www.pcmag.com/explainers/how-much-does-starlink-service-cost-in-2026-spacex', 'https://www.basenor.com/blogs/news/starlink-2026-whats-changing-and-what-it-means-for-you', 'https://broadbandbreakfast.com/spacex-planning-terrestrial-deployments-to-support-direct-to-device/'],
  },
  {
    slug: 'agentic-ai-security-wake-up-call',
    order: 9,
    topic: 'Trending: The AI Agent Security Wake-Up Call',
    angle: 'AI agents can now act on your behalf — here’s what went wrong this month and how to protect yourself.',
    factSheet: `- Sept 2026: agentic AI (systems that take actions autonomously) is the dominant tech story, bringing security and regulatory fallout.
- Meta’s Muse AI agent: reported zero-day flaw in its Mac app that could expose user data, plus a separate SEV-2 issue involving VM exposure. Amazon blocked Muse from its platform citing terms-of-service violations.
- Researchers found hundreds of AI-agent “skills” referencing unreserved placeholder domains that attackers are registering for phishing/malware.
- Google confirmed Gemini models inadvertently accessed real corporate systems during a cybersecurity training exercise due to a configuration error.
- Regulation: California passed a seven-bill package requiring data centers to disclose water/electricity use; New York City Council introduced a 10-bill package including AI “kill switches”, third-party validation and whistleblower bounties.
- Australia summoned OpenAI and Anthropic executives over security breaches involving government databases.
- Viewer protection checklist: least-privilege permissions, review agent actions, separate accounts/API keys, avoid unknown third-party skills, keep apps updated, enable 2FA.
- Present items as “reported”; avoid speculation beyond these facts.`,
    sources: ['https://techstartups.com/2026/09/22/top-tech-news-today-september-228-2026-amazon-amd-google-meta-openai-tesla-more/', 'https://aiweekly.co/ai-news-today'],
  },
  {
    slug: 'amd-trillion-dollar-ai-chip-race',
    order: 10,
    topic: 'Trending: AMD Hits $1 Trillion — The AI Chip Race',
    angle: 'How AMD joined the trillion-dollar club, where Nvidia and China fit in, and what it means for PC buyers.',
    factSheet: `- Sept 2026: AMD reached a $1 trillion market capitalization, driven by demand for AI-capable hardware.
- Nvidia’s Vera Rubin platform is in full production for 2H 2026 AI data centers.
- China push for AI independence: Alibaba unveiled the Zhenwu V900 chip and plans models up to 10 trillion parameters while seeking to work around US export controls.
- Bond markets are becoming more selective on debt from AI-heavy companies; some officials (e.g. Reserve Bank of Australia governor) question whether AI infrastructure spending is yielding productivity gains.
- Consumer impact: AI demand is a key driver of record DRAM prices and pressure on GPU pricing.
- AMD consumer angle: RX 9000-series GPUs (e.g. RX 9060 XT 16GB at $349) and Ryzen AI Halo ($3,999, 128GB) show AMD’s AI push reaching desktops.
- Not financial advice — present as news analysis only.`,
    sources: ['https://techstartups.com/2026/09/22/top-tech-news-today-september-228-2026-amazon-amd-google-meta-openai-tesla-more/', 'https://nvidianews.nvidia.com/news/vera-rubin-full-production-agentic-ai-factory'],
  },
]

export const PIPELINE_STAGES = [
  { id: 'planned', label: 'Planned' },
  { id: 'scripted', label: 'Scripted' },
  { id: 'visuals', label: 'Visuals' },
  { id: 'voiced', label: 'Voiced' },
  { id: 'rendered', label: 'Rendered' },
  { id: 'published', label: 'Published' },
] as const

export type PipelineStage = (typeof PIPELINE_STAGES)[number]['id']

export interface VideoScene {
  heading: string
  narration: string
  visualPrompt: string
  onScreenText: string
}

export interface VideoScript {
  youtubeTitle: string
  altTitles: string[]
  hook: string
  scenes: VideoScene[]
  cta: string
  description: string
  tags: string[]
  thumbnailText: string
  thumbnailPrompt: string
}
