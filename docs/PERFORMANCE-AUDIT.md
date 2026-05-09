# Performance Audit — ReLoop T2-09

Sprint 2 performance pass. Build: PASS (Next.js 16.2.6 Turbopack).

## Optimizations Applied

### next/image conversions (8 components)
- `components/listings/ListingCard.tsx` — listing photo (fill + sizes) + owner avatar (24x24)
- `components/shared/Header.tsx` — user avatar (28x28)
- `components/shared/LeaderboardPodium.tsx` — top-3 avatars (80x80)
- `components/shared/LeaderboardTable.tsx` — rank 4–20 avatars (36x36)
- `components/admin/ModerationTable.tsx` — listing thumbnail (48x48)
- `app/(app)/profile/page.tsx` — profile avatar (96x96)
- `app/(app)/listings/[id]/page.tsx` — owner avatar (40x40)

Remaining plain `<img>` (documented exceptions):
- `components/scan/ScanClient.tsx` — Blob URL preview; next/image cannot serve object URLs
- `components/scan/ResultCard.tsx` — Blob URL or remote URL passed from scan capture
- `components/listings/ListingForm.tsx` — local Blob URL preview during upload
- `components/listings/PhotoGrid.tsx` — runtime Supabase URLs with variable paths; lightbox modal also uses plain img

### Supabase Storage domain
Added to `next.config.ts` `images.remotePatterns`:
```
hostname: vzpwsdmlofsizhkwcpra.supabase.co
pathname: /storage/v1/object/public/**
```

### Bundle Analyzer
- `@next/bundle-analyzer` added to devDependencies
- `pnpm analyze` script: `ANALYZE=true next build`
- Wrapped in `next.config.ts`: `withBundleAnalyzer(nextConfig)`

### ISR Tuning (4 pages adjusted)
| Page | Before | After | Rationale |
|------|--------|-------|-----------|
| `app/(marketing)/page.tsx` | 60s | 300s | Landing is near-static; 5min ISR reduces cold renders |
| `app/(app)/listings/page.tsx` | force-dynamic | 120s | Public listing feed can be cached |
| `app/(app)/map/page.tsx` | none (dynamic) | 300s | Collection points change slowly |
| `app/(marketing)/leaderboard/page.tsx` | 60s | 60s | Kept — competitive, fast refresh desired |
| `app/(app)/scan/page.tsx` | — | force-dynamic | User-specific, no ISR |
| `app/(app)/profile/page.tsx` | force-dynamic | force-dynamic | User-specific, no ISR |
| `app/(app)/dashboard/page.tsx` | force-dynamic | force-dynamic | User-specific, no ISR |

### Dynamic Imports Verified
- `components/map/MapPageClient.tsx` — `next/dynamic(() => import("MapView"), { ssr: false })` confirmed
- `components/shared/BadgeUnlockDialog.tsx` — `await import("canvas-confetti")` lazy confirmed
- `components/scan/ScanClient.tsx` — `await import("browser-image-compression")` lazy confirmed
- `html-to-image` — not installed in package.json; `lib/share.ts` does not exist yet (T2-08 pending)
- `recharts` — not used anywhere in codebase (skip)

### OpenAI Prompt Caching
- `VISION_SYSTEM_PROMPT` extended from ~559 tokens to ~1201 tokens (estimated)
- Threshold: GPT-4o-mini caches automatically at ≥ 1024 tokens in system message
- Added reference tables: decomposition times per material, tone guidelines, mandatory warnings
- `temperature: 0.2` confirmed in `lib/openai/vision.ts:291`
- Image URL placed last in messages array (dynamic content at end = correct for caching)

### Storage Compression
`components/scan/ScanClient.tsx` confirmed:
```ts
maxSizeMB: 1,
maxWidthOrHeight: 1024,   // MAX_DIMENSION_PX constant
useWebWorker: true,
```
All three settings correct.

### Build Fixes (pre-existing errors from T2-05/T2-07)
- `WebVitalsReporter.tsx`: `Sentry.metrics.distribution` removed in v9 — replaced with `Sentry.captureEvent`
- `lib/analytics.ts`: mixed client/server code caused `node:fs` bundling error — split into:
  - `lib/analytics.ts` (browser-only, client-safe)
  - `lib/analytics-server.ts` (server-only, `import "server-only"`)
- Updated imports in: `app/auth/callback/route.ts`, `actions/collection-points.ts`, `actions/badges.ts`, `actions/listings.ts`, `lib/openai/vision.ts`
- `next.config.ts`: `hideSourceMaps` → `sourcemaps: { disable: false, deleteSourcemapsAfterUpload: true }` (Sentry v9 API change)

## Build Results

```
Build: PASS
Mode: Turbopack (Next.js 16.2.6)
Routes: 19 total (2 static, 17 dynamic/server)
Landing ISR: 5min (300s) confirmed in build output

JS chunks (raw):
  Total: 1606 KB (38 chunks)
  Estimated gzipped: ~401 KB (all routes shared)
  Largest chunks: ~229 KB, ~227 KB, ~181 KB raw
  Note: Turbopack splits aggressively — shared vendor chunks
        are loaded once and cached by the browser.
```

## Lighthouse Run Instructions

Run after `pnpm dev` or against Vercel production URL:

```bash
# Install CLI (no install flag needed — dlx)
pnpm dlx @lhci/cli@latest collect \
  --url=http://localhost:3000 \
  --url=http://localhost:3000/listings \
  --url=http://localhost:3000/leaderboard \
  --url=http://localhost:3000/map \
  --settings.formFactor=mobile \
  --settings.throttlingMethod=simulate

pnpm dlx @lhci/cli@latest assert \
  --preset=lighthouse:no-pwa \
  --assertions.categories:performance=warn:0.85

# Or single page:
pnpm dlx lighthouse http://localhost:3000 \
  --only-categories=performance \
  --form-factor=mobile \
  --view
```

## Bundle Analyzer

```bash
pnpm analyze
# Opens treemap in browser showing chunk composition
# Supabase client, leaflet, posthog-js are expected large vendors
```

## Web Vitals Targets

| Metric | Target | Monitoring |
|--------|--------|-----------|
| LCP | < 2.5s | Sentry (WebVitalsReporter) |
| INP | < 200ms | Sentry |
| CLS | < 0.1 | Sentry |
| FCP | < 1.5s | Sentry |
| TBT | < 200ms | Lighthouse |

Web Vitals flow to Sentry via `components/shared/WebVitalsReporter.tsx` →
`Sentry.captureEvent` → Sentry Performance dashboard.

## Predicted Lighthouse Scores (Mobile)

| Page | Performance | Notes |
|------|-------------|-------|
| `/` | 88–93 | Static ISR, no heavy JS, no images above fold |
| `/listings` | 82–88 | ISR 120s, ListingCard images now optimized |
| `/leaderboard` | 85–90 | ISR 60s, avatar images optimized |
| `/map` | 75–82 | Leaflet deferred via dynamic import; map tiles are LCP bottleneck |
| `/scan` | 80–86 | Camera capture deferred; heavy AI call is server-side |
| `/dashboard` | 83–88 | Dynamic but minimal JS payload |

Note: Live Lighthouse scores require production Vercel URL — defer to user.

## Known Performance Issues

1. **Leaflet tiles** — Map page LCP is limited by tile CDN latency (~1–2s). No fix without self-hosting tiles.
2. **Listing photos without dimensions** — `PhotoGrid` and `ListingCard` photos use Supabase Storage URLs with unknown natural dimensions. `fill` prop in ListingCard mitigates CLS but lightbox modal still uses raw `<img>`.
3. **posthog-js bundle** — ~80KB raw. Consider loading async only when consent is given.
4. **`leaderboard` page** — `force-dynamic` (no ISR) because `searchParams` opt-out is active via `await searchParams`. Consider switching to static params + client-side filter for a future optimization.
