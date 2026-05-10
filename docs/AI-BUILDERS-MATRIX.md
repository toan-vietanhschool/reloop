# AI BUILDERS COMPARISON MATRIX — ReLoop

> Decision matrix for choosing AI builders for the ReLoop project (TDTU Vibe Coding 2026). Compares Lovable, Bolt.new, v0.dev, Cursor, and Replit Agent across capabilities relevant to ReLoop's stack (Next.js 15 + Supabase + OpenAI + Leaflet + Vercel).

---

## Section A — Quick recommendation

**For ReLoop, recommend Lovable as the primary full-stack builder, supplemented by v0.dev for hero/share-card visuals and Cursor for fine-grained polish.** Lovable has the deepest Supabase integration (auto-RLS, schema visualization, migration runner), which directly serves ReLoop's hardest rubric criterion (TC6 Bảo mật 10đ via 14-table RLS policy correctness).

---

## Section B — Comparison table

| Capability | **Lovable** | **Bolt.new** | **v0.dev** | **Cursor** | **Replit Agent** |
|---|---|---|---|---|---|
| Full-stack? | Yes (Next.js + Supabase native) | Yes (WebContainer + external services) | No (UI components only) | No (IDE only — pairs with any backend) | Yes (full Replit container) |
| Supabase native? | Yes (1-click connect, auto migrations, RLS UI) | External project only via env vars | No | Manual (developer wires it) | External via env vars |
| OpenAI integration? | Native (env var + scaffolded route) | Manual (write Route Handler + env var) | No | Manual (Cmd+K generates route) | Manual via env var |
| Custom SQL migrations? | Yes (in-IDE migration runner + visual builder) | Yes (paste into Supabase SQL Editor or `supabase db push` from terminal) | No | Yes (any IDE workflow) | Yes (terminal access) |
| Mobile responsive QA? | Yes (built-in 375/768/1440 preview frames) | Yes (preview iframe with device emulation) | Limited (single preview, no breakpoint switcher) | No (rely on browser DevTools) | Limited (preview tab) |
| Iterate on existing repo? | Yes (GitHub sync, can import Next.js repo) | Yes (import GitHub or paste code) | No (fresh component each chat) | Yes (works on any local repo — primary use case) | Yes (import GitHub) |
| Free tier sufficient for ReLoop scope? | Limited (free tier has message cap; pro recommended for 21-day demo cycle) | Limited (free has token cap; pro for production iterations) | Yes (Vercel free tier generous for component generation) | Yes for hobby, Pro $20/mo for unlimited | Limited (free has compute hour cap) |
| Best for? | Full-stack MVPs with Supabase backbone | Full-stack MVPs with Vercel-first deploy | Designer-grade UI components, hero sections, marketing pages | Surgical edits, refactors, long-context cross-file changes | Containerized apps with persistent backend (good for Python/Flask/Discord bots) |
| Cost estimate for ReLoop full build (rough) | $20-40 (Lovable Pro 1 month) + $0 Supabase + ~$3 OpenAI = **~$25-45 total** | $20 (Bolt Pro 1 month) + $0 Supabase + ~$3 OpenAI + Vercel Hobby free = **~$25 total** | $0 (v0 free) — supplement only | $20 (Cursor Pro 1 month) + manual everything = **~$25 total** if user codes themselves | $25 (Replit Core 1 month) + ~$3 OpenAI = **~$30 total** |
| Pre-flight check needed? | Yes — see [LOVABLE-PROMPT.md](LOVABLE-PROMPT.md) Section 0 (17 stack items) | Yes — see [BOLT-PROMPT.md](BOLT-PROMPT.md) Section 0 (15 WebContainer items) | No (presentational only, no infra) | No (IDE — no platform constraints) | Yes (recommended — verify Postgres/cron support) |

---

## Section C — Recommended workflow for ReLoop

A multi-tool pipeline maximizes strengths and minimizes weaknesses:

### Phase 1 — Design (Day 1-2)
Use **v0.dev** to generate the 5 visual showpieces:
1. Hero section (landing page differentiator)
2. Scan result card (AI Vision output — gánh 25/100 điểm Bán kết)
3. Leaderboard podium (gamification)
4. Eco Score share card 1080×1080 (viral hook for Poster Award)
5. Admin moderation table

Copy generated JSX into `D:\reloop\components\` per the folder convention in `LOVABLE-PROMPT.md` Section 8. v0 output is presentational only — props get wired in Phase 2.

### Phase 2 — Backend + business logic (Day 3-14)
Use **Lovable** as primary builder. Feed it `LOVABLE-PROMPT.md`. Lovable handles:
- Next.js scaffolding + Tailwind + shadcn/ui init
- Supabase project connect + 14-table migration with RLS
- Auth flow (magic link + Google OAuth)
- Server Actions for listings CRUD, profile, points
- Route Handler for `/api/ai/analyze-image`
- Map page with Leaflet + 20 seeded collection points
- Sprint 2: badges, leaderboard, admin panel, share card wiring, PostHog, Sentry, CI

**Why Lovable over Bolt for this phase:** Lovable's RLS visualization tool catches policy gaps that would tank Rubric 4.1 (10đ Bán kết) + TC6 (10đ Chung kết). Bolt's WebContainer model also adds Sharp/native binary friction for `next/image`.

**Alternative:** if Lovable Pro budget is unavailable, **Bolt.new** is the runner-up — feed it `BOLT-PROMPT.md` (Sprint 1 iterative). Trade-off: do RLS verification by hand via Supabase Dashboard.

### Phase 3 — Tweaks + polish (Day 15-19)
Switch to **Cursor IDE** in `D:\reloop\` for fine-grained edits. Cursor excels at:
- Cross-file refactors via Cmd+K (e.g., extracting `lib/openai/prompts.ts` from inline strings)
- Bug fixes that need awareness of multiple components at once
- Test writing alongside implementation (Vitest + Playwright)
- Performance audit (T2-09 — bundle analyzer wiring, image dimension audit, ISR tuning)
- Vietnamese copy tightening (it understands existing tone from neighbor files)

### Phase 4 — Production deploy (Day 20)
- **Vercel** (auto from Lovable/Bolt). Set env vars: `OPENAI_API_KEY`, `SUPABASE_*`, `POSTHOG_*`, `SENTRY_*`, `CRON_SECRET`.
- Configure Vercel Cron for `/api/cron/leaderboard` hourly (Sprint 2).
- Domain: `reloop.app` or `<project>.vercel.app`.

### Phase 5 — Monitoring (Day 21+)
- **PostHog** dashboards: DAU + funnel scan_started → scan_success → listing_created + top events 7d.
- **Sentry**: client/server/edge runtimes wired, release tagged via `VERCEL_GIT_COMMIT_SHA`, PII scrub in `beforeSend`.
- Pre-demo T-1h checklist (per `LOVABLE-PROMPT.md` Section 4 → T2-10).

---

## Section D — Decision tree (when to use which)

```
Q1: Need full-stack from scratch with Supabase + Postgres + RLS?
├── Yes
│   ├── Want deepest Supabase integration (RLS UI, schema viz)?
│   │   └── Lovable ⭐ (recommended for ReLoop)
│   └── Want best Vercel deploy integration + WebContainer dev preview?
│       └── Bolt.new (runner-up; iterative prompts via BOLT-PROMPT.md)
└── No → Q2

Q2: Already have a repo and want incremental features or refactors?
├── Need cross-file context awareness + IDE-level control?
│   └── Cursor (Cmd+K refactor, multi-file edits)
└── Need agent-driven feature additions in containerized environment?
    └── Replit Agent (good for Python/Discord bot side-projects, less ideal for Next.js)

Q3: Need design fidelity (hero sections, share cards, marketing pages)?
├── Want Vercel-grade JSX components ready to copy-paste?
│   └── v0.dev ⭐ (use V0-PROMPT.md, 5 sub-prompts ready)
└── Want high-fidelity Figma-like exports?
    └── Stitch (Google) — alternative for design comps that get hand-coded

Q4: Need Vietnamese language model for AI features?
└── All builders support OpenAI gpt-4o-mini, which handles Vietnamese well at 0.2 temperature with Vietnamese system prompt. No Vietnamese-tuned model needed for ReLoop's scope. (Future: PhoGPT or VinaLLaMA could be evaluated for offline alternative — not required for MVP.)

Q5: Tight budget (free tier only)?
├── v0.dev (free) for components → manually integrate in Cursor (free hobby tier on small repos)
└── Lovable/Bolt free tiers will hit message caps before Sprint 2 completes; budget $20-25 for Pro.
```

---

## Section E — Cross-references

The 3 prompt files in this `docs/` directory:

- **[LOVABLE-PROMPT.md](LOVABLE-PROMPT.md)** — Full-stack Sprint 1 + Sprint 2, ~4500 words, 9 sections including 17-item pre-flight check, full DB schema with 14 tables + RLS, all 20 features (T1-01 → T2-10), rubric mapping, design system, anti-patterns, folder convention, build sequence. **Primary recommended prompt.**

- **[BOLT-PROMPT.md](BOLT-PROMPT.md)** — Full-stack Sprint 1 only, ~2500 words, iterative model. 15-item WebContainer-specific pre-flight check (Sharp lib, native binary constraints, Supabase external connect, OpenAI streaming from WebContainer, Leaflet ssr:false). DB schema referenced by enum + table names + RLS strategy (full DDL requested when ready). Sprint 2 added later via follow-up prompts. **Runner-up.**

- **[V0-PROMPT.md](V0-PROMPT.md)** — Design-only, 5 sub-prompts, ~2000 words total. Each sub-prompt 200-400 words copy-paste ready into v0.dev: HeroSection, ScanResultCard, LeaderboardPodium, EcoScoreCard 1080×1080, ModerationTable. Mobile-first, Vietnamese mandatory, Tailwind v4 token names (`bg-brand-green`, `text-text-muted`). **Supplement to Lovable/Bolt for visual showpieces.**

---

## Section F — Risks per builder choice

| Builder | Top risk for ReLoop | Mitigation |
|---|---|---|
| Lovable | Auto-generated migrations may use non-optimal RLS pattern (`auth.uid()` instead of `(select auth.uid())` — perf hit on large tables) | Manually audit migration SQL before applying; reference `LOVABLE-PROMPT.md` Section 3 RLS strategy |
| Bolt.new | WebContainer can't run native libs → `next/image` optimization broken if Sharp expected | Set `images.unoptimized=true` in `next.config.ts` OR use Cloudflare loader; pre-flight Section 0 item 8 surfaces this |
| v0.dev | Generated components may not match brand tokens 1:1 (hardcoded hex instead of `bg-brand-green`) | DESIGN SYSTEM preamble at top of every sub-prompt enforces tokens; verify after paste with grep `oklch` in generated file |
| Cursor | No agent — slower for greenfield scaffolding (45 mins to do what Lovable does in 5) | Use Cursor only after Phase 2; not for initial scaffold |
| Replit Agent | Vercel deploy not first-class (Replit pushes own hosting) | Skip Replit for ReLoop; reserved for Python/Discord bot side projects |

---

## Section G — Final pick rationale

ReLoop's scoring rubric weights heavily toward backend correctness:
- **Rubric 4.1 + TC6** (RLS, security): **20 points** combined
- **Rubric 3.2 + TC5** (DB design): **20 points** combined
- **Rubric 1.2** (AI integration): **10 points**

That's 50/100+ points sitting on backend quality. Lovable's Supabase-native tooling (RLS UI, migration runner, type generation) directly de-risks these criteria. Bolt and Replit can hit the same target but with more manual verification.

**Visual differentiators** (3 differentiators in Section 1 of each prompt — AI scan, hai luồng, map crowdsourced) need real design polish to stand out at Bán kết. v0.dev's 5 sub-prompts cover the highest-visibility surfaces (hero, scan result card, share card) without burning Lovable iterations on pixel pushing.

**Cursor** is the cleanup crew for the last week — performance audit, Vietnamese copy passes, test writing. No agent can match Cursor's Cmd+K + Tab-complete loop for surgical edits in a finished codebase.

This 3-tool stack (Lovable + v0 + Cursor) keeps total spend ~$45 for the full 21-day demo cycle while hitting the rubric ceiling: ~92/100 Bán kết, ~94/100 Chung kết.

---

**END OF MATRIX — see linked prompt files to start building.**
