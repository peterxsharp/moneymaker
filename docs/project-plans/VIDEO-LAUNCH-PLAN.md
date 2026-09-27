# Video Launch Plan — TechAssist Edge

Extracted from `lib/video-launch-plan.ts`. Fact sheets researched **2026-09-27** and injected verbatim into script generation so the model stays on verified facts.

- **Channel:** TechAssist Edge — https://www.youtube.com/@TechAssist-Edge
- **Launch date:** 2026-10-05 16:00 UTC
- **Format:** faceless tech, 6–8 minute videos (1,000–1,250 spoken words), confident/helpful/no-hype voice.
- **Pipeline stages:** Planned → Scripted → Visuals → Voiced → Rendered → Published.

---

## 1. RAM Pricing in 2026
- **Slug:** `ram-pricing-crisis-2026`
- **Angle:** Why DDR5 and DDR4 cost so much right now, what is driving it, and whether to buy now or wait.
- **Fact sheet:**
  - Late Sept 2026: DRAM prices at/near record highs, driven by AI/data-center demand outpacing fab capacity.
  - 32GB (2x16GB) DDR5-6000 retail kits typically $429–$604; median ≈ $17.50–$17.97 per GB.
  - DDR4 ≈ $7.77–$7.81 per GB (~56% cheaper than DDR5), but supply squeezed as makers wind down DDR4.
  - DDR4 1Gx8 3200 chip hit a record spot price of $46.11 on Sept 24, 2026.
  - Price trackers show DDR4 and DDR5 at the top of their recent two-month ranges.
  - HBM contract pricing: HBM3E ≈ $12.00–$12.80/GB; HBM4 est. ≈ $16/GB.
  - Analysts (Gartner, Counterpoint, TrendForce) expect no meaningful relief before late 2027.
  - Advice: buy what you need now; 32GB DDR5 is the sweet spot; DDR4 only if reusing parts.
- **Sources:** capitalandcompute.net/memory-prices, tomshardware.com RAM price index 2026, rampricesusa.com/ram-price-trends

## 2. Choosing a Mid-Range Graphics Card
- **Slug:** `best-mid-range-gpus-2026`
- **Angle:** The smart buyer's guide to the $249–$429 GPU bracket and the 8GB VRAM trap.
- **Fact sheet:**
  - 2026 mid-range ≈ $249–$429; Nvidia RTX 50-series vs AMD RX 9000-series (RDNA 4).
  - "VRAM cliff": 8GB cards stutter in modern titles (esp. frame gen); 16GB favored for 1440p longevity.
  - AMD RX 9060 XT 16GB — $349: best value; ~16% faster than RTX 5060 Ti 8GB at 1440p, cheaper; efficient (ITX).
  - Nvidia RTX 5060 Ti 16GB — $429: best all-rounder (DLSS 4 Multi-Frame Gen, ray tracing, CUDA).
  - Intel Arc B580 — $249, 12GB: best budget 1440p; best on PCIe 4.0+.
  - Avoid 8GB cards for 1440p Ultra. AI demand may push future GPU pricing up.
- **Sources:** switchbladegaming.com best-mid-range-gpu-2026, newegg.com rtx-5000-vs-rx-9000, techspot.com bestof gpu-25-26

## 3. AMD Ryzen AI Halo — The Local AI Box
- **Slug:** `amd-ryzen-ai-halo-box`
- **Angle:** Can a $3,999 mini PC with 128GB unified memory replace the cloud for running your own AI models?
- **Fact sheet:**
  - Built on Strix Halo — Ryzen AI Max+ 395 (Zen 5, Radeon 8060S iGPU 40 RDNA 3.5 CUs, XDNA 2 NPU ≈ 50 TOPS).
  - 128GB unified LPDDR5x-8000, 256-bit bus ≈ 256 GB/s; GPU addresses large models directly.
  - US launch $3,999. Bandwidth-bound: MoE ≈25–45 tok/s (27B–35B); coder MoE ≈100 tok/s; dense 70B ≈ 4–9 tok/s.
  - Software: ROCm + Vulkan/RADV; Ollama & llama.cpp usable in 2026 (less plug-and-play than CUDA; Linux best).
  - vs Nvidia DGX Spark ($4,699, Linux/CUDA): Halo ≈ $700 cheaper, runs Windows 11.
  - vs Mac Studio M4 Max ($1,999–$5,999): Mac ≈546 GB/s (faster tokens) but macOS/MLX-locked.
  - vs RTX 5090 (32GB): far faster for image/video gen + small models, can't hold 100GB+ models.
  - Coming: Ryzen AI Max 400-series refresh; Max+ PRO 495 expected up to 192GB.
- **Sources:** tweaktown.com, techpowerup.com, compute-market.com

## 4. Logitech's Latest Keyboards & Mice
- **Slug:** `logitech-2026-keyboards-mice`
- **Angle:** Signature Comfort Plus, the new MX Keypad, and MX Master 4 — what's worth buying.
- **Fact sheet:**
  - June 2026: Signature Comfort Plus — mouse w/ sculpted palm cushion ($49.99), keyboard combo w/ dual-foam wrist rest ($109.99).
  - Sept 2026: MX Keypad — programmable macro pad, 9 LCD-backlit keys, Logi Options+; $99.99 (from MX Creative Console).
  - MX Master 4 (late 2025) remains flagship productivity mouse.
  - No new "MX Keys" keyboard announced as of Sept 2026 (speculation only).
  - FCC filings hint at minor MX Mechanical / Mini revisions (incremental), no confirmed date.
  - Do NOT claim unannounced products exist; frame refreshes as rumor.
- **Sources:** techradar.com, theregister.com, notebookcheck.net

## 5. Samsung Galaxy Watch Ultra2
- **Slug:** `samsung-galaxy-watch-ultra2`
- **Angle:** The toughest, brightest Galaxy Watch yet — specs, new health features, and who should buy it.
- **Fact sheet:**
  - Announced July 22, 2026 (Unpacked); released Aug 7, 2026.
  - 47mm cushion design, 10.7mm thick; grade 4 titanium, sapphire crystal.
  - 1.52" Super AMOLED, 5,000 nits peak (smartwatch record at launch).
  - Snapdragon SW6100 Wear Elite (3nm), 2GB RAM, 64GB; Wear OS 7 / One UI Watch 9.
  - 800 mAh Si-C battery (+35%); 10W wireless, ~40% in ~30 min.
  - Durability: IP69K, 10ATM, MIL-STD-810H; EN13319 dive certified.
  - Sensors: BioActive, body/water temp, HR, SpO2, ECG.
  - New: Trail Run, Nutrition Alert (hydration), Vitals / Heart Health Score.
  - Connectivity: LTE eSIM, Bluetooth 6.0, dual-band Wi-Fi, dual-freq GPS (L1+L5).
  - Do not state price unless certain; point to link in description.
- **Sources:** gsmarena.com, news.samsung.com, androidcentral.com

## 6. Using Abacus AI to Build Streamlined Workflows
- **Slug:** `abacus-ai-streamlined-workflows`
- **Angle:** Replacing a pile of AI subscriptions with one workspace and letting an agent do the busywork.
- **Fact sheet:**
  - All-in-one AI platform: ChatLLM (multi-model chat) + autonomous agent for multi-step execution.
  - ChatLLM: many frontier models (GPT-5.6, Claude Opus 4.8, Gemini 3.1 Pro) with intelligent routing.
  - Also image/video generation, document analysis, presentations.
  - Agent: dashboards, full-stack web apps, research synthesis, browser automation, scheduled tasks.
  - 2026 additions reported: Abacus Claw (persistent agent layer) and Abacus AI Desktop.
  - Pricing (reported): Basic $10/mo (20,000 credits); Pro $20/mo (30,000 credits); enterprise custom.
  - Caveats: credit billing hard to predict; advanced agent builds have a learning curve.
  - Feature this channel's own pipeline (research/scripting/thumbnails/rendering) built with Abacus AI.
  - Tips: start with one repeatable task, clear brief, let agent build a tool, schedule it, review weekly.
- **Sources:** blog.abacus.ai, aijourn.com, aitrendtool.com

## 7. Nvidia Vera Rubin Explained
- **Slug:** `nvidia-vera-rubin-platform`
- **Angle:** Seven chips, one AI supercomputer — what Vera Rubin is and why it matters even if you never buy one.
- **Fact sheet:**
  - Announced CES 2026; named after astronomer Vera Rubin. Full production; partner availability 2H 2026.
  - Seven-chip codesign: Vera CPU, Rubin GPU, NVLink 6 Switch, ConnectX-9 SuperNIC, BlueField-4 DPU, Spectrum-6 Ethernet, Groq 3 LPU.
  - Vera CPU: 88 custom Olympus Arm cores (Armv9.2), Spatial Multithreading.
  - Rubin GPU: 224 SMs, HBM4, 3rd-gen Transformer Engine, 50 petaflops NVFP4.
  - NVLink 6: 3.6 TB/s per GPU.
  - vs Blackwell: ~90% lower cost per inference token; 75% fewer GPUs to train large MoE.
  - Inference Context Memory Storage (BlueField-4) for KV-cache sharing — up to 5x inference throughput.
  - Vera Rubin NVL72 rack: 72 Rubin GPUs + 36 Vera CPUs.
  - Cloud partners: AWS, Google Cloud, Azure, Oracle; CoreWeave, Lambda, Nebius.
  - Why it matters: cheaper tokens → cheaper/faster AI apps; explains RAM/HBM squeeze on consumer prices.
- **Sources:** nvidianews.nvidia.com (rubin platform + full production), developer.nvidia.com blog

## 8. SpaceX & Starlink Offerings in 2026
- **Slug:** `spacex-starlink-plans-2026`
- **Angle:** Every Starlink plan decoded — home, roam, mobile, aviation — plus what V3 satellites and Starship change.
- **Fact sheet:**
  - Residential ≈ $55/$85/$130/mo by speed/priority; Standard 4 kit (Mini Router) / Standard 4 X (Gen 3). Promos incl. $39/mo (through Mar 2026), free equipment rental.
  - Roam (Starlink Mini): $55/mo 100GB, $80/mo 300GB, $175/mo unlimited; Standby $10/mo.
  - "Direct to Cell" rebranded Starlink Mobile — satellite coverage when out of tower range; partners incl. Deutsche Telekom.
  - Aviation: 300MPH $250/mo (20GB), 450MPH $1,000/mo (20GB) for aircraft above the 100 mph Roam limit.
  - Priority (business/maritime): Performance Gen 3 dish; e.g. 1TB for $290/mo.
  - V3 satellites: ~10x downlink capacity of V2, launched on Starship.
  - SpaceX plans small terrestrial stations to boost direct-to-device.
  - Prices vary by region/change often — verify at starlink.com.
- **Sources:** pcmag.com, basenor.com, broadbandbreakfast.com

## 9. Trending: The AI Agent Security Wake-Up Call
- **Slug:** `agentic-ai-security-wake-up-call`
- **Angle:** AI agents can now act on your behalf — what went wrong this month and how to protect yourself.
- **Fact sheet:**
  - Sept 2026: agentic AI is the dominant story, with security + regulatory fallout.
  - Meta's Muse AI agent: reported zero-day in Mac app exposing data + separate SEV-2 VM exposure. Amazon blocked Muse citing ToS.
  - Researchers found hundreds of AI-agent "skills" referencing unreserved placeholder domains attackers are registering for phishing/malware.
  - Google confirmed Gemini models inadvertently accessed real corporate systems during a training exercise (config error).
  - Regulation: California 7-bill package (data-center water/electricity disclosure); NYC Council 10-bill package (AI "kill switches", third-party validation, whistleblower bounties).
  - Australia summoned OpenAI + Anthropic execs over breaches involving government databases.
  - Protection checklist: least-privilege permissions, review agent actions, separate accounts/API keys, avoid unknown third-party skills, update apps, enable 2FA.
  - Present items as "reported"; avoid speculation.
- **Sources:** techstartups.com, aiweekly.co

## 10. Trending: AMD Hits $1 Trillion — The AI Chip Race
- **Slug:** `amd-trillion-dollar-ai-chip-race`
- **Angle:** How AMD joined the trillion-dollar club, where Nvidia and China fit in, and what it means for PC buyers.
- **Fact sheet:**
  - Sept 2026: AMD reached $1T market cap, driven by AI hardware demand.
  - Nvidia Vera Rubin in full production for 2H 2026 AI data centers.
  - China AI independence: Alibaba unveiled Zhenwu V900 chip, plans models up to 10T params, working around US export controls.
  - Bond markets more selective on AI-heavy company debt; some officials question productivity gains.
  - Consumer impact: AI demand drives record DRAM prices + GPU pressure.
  - AMD consumer angle: RX 9000-series (RX 9060 XT 16GB $349), Ryzen AI Halo ($3,999, 128GB).
  - Not financial advice — news analysis only.
- **Sources:** techstartups.com, nvidianews.nvidia.com

---

## Pipeline stages
`planned → scripted → visuals → voiced → rendered → published`

## Script schema (`VideoScript`)
Each generated script includes: `youtubeTitle`, `altTitles[]`, `hook`, `scenes[]` (each: `heading`, `narration`, `visualPrompt`, `onScreenText`), `cta`, `description`, `tags[]`, `thumbnailText`, `thumbnailPrompt`.
