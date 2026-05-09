# Responsive + WCAG 2.2 AA Static Audit

> Scope: ReLoop Sprint 1+2 UI as of 2026-05-10. Static analysis only — no live device testing. Target viewport: iPhone SE (375×667 CSS px). Compliance target: **WCAG 2.2 Level AA**.

## Executive Summary

| Severity | Count | Definition |
|---|---|---|
| CRITICAL | 0 | Layout broken at 375px (overflow off-screen, content unreachable). |
| HIGH | 4 | A11y violation — failing WCAG 2.2 AA criterion. |
| MEDIUM | 6 | Suboptimal but workable; queue for Sprint 3. |
| LOW | 4 | Polish / consistency. |

**Mobile 375px estimate:** PARTIAL — admin tables horizontally scroll (acceptable), but no layout breakages. Hero, listings grid, map drawer, scan flow all reflow correctly.

**WCAG 2.2 AA estimate:** PARTIAL — passes most criteria; gaps in target size on 1 component (now fixed inline) and skip-link bypass (now fixed inline). Color contrast not verifiable statically without a live render — manual spot-check required.

## Tailwind Breakpoint Reference

| Prefix | Min width | Typical device |
|---|---|---|
| (none) | 0 px | iPhone SE 375, all small phones |
| `sm:` | 640 px | Large phones landscape |
| `md:` | 768 px | Tablet portrait |
| `lg:` | 1024 px | Tablet landscape, small laptop |
| `xl:` | 1280 px | Desktop |
| `2xl:` | 1536 px | Wide desktop |

## Findings (per file, ordered by severity)

### HIGH (a11y violations)

| # | File:Line | Issue | WCAG | Fix |
|---|---|---|---|---|
| H1 | `app/layout.tsx` (whole app) | No skip-link to bypass repeated header nav. Keyboard-only users tab through all top-bar links every page load. | 2.4.1 Bypass Blocks | **FIXED inline** — skip link added in `<body>`, targets `#main-content` ids in `(marketing)/layout.tsx` and `(app)/layout.tsx`. |
| H2 | `components/map/VoteButtons.tsx:113-147` | Up/down vote buttons used `h-3 w-3` icon + `px-2 py-1` — total ~22-24px. Below WCAG 2.5.8 24×24 minimum on iOS Safari. | 2.5.8 Target Size | **FIXED inline** — bumped to `min-h-[24px]` + `px-2.5 py-1.5` + `h-3.5 w-3.5` icon. Also added explicit `focus-visible:ring-2`. |
| H3 | `components/listings/ListingForm.tsx:286` | "Remove photo" button `h-6 w-6` (24×24 exact, but cluttered with `right-1 top-1` overlap). | 2.5.8 Target Size | **FIXED inline** — bumped to `h-7 w-7` + focus ring. |
| H4 | `components/scan/ResultCard.tsx:133`, `components/scan/EcoScoreCard.tsx:166`, `components/listings/PhotoGrid.tsx:69`, `components/listings/ListingForm.tsx:276`, `components/scan/ShareDialog.tsx:308`, `components/scan/ScanClient.tsx:173` | 6 × `<img>` tags use `eslint-disable-next-line` to bypass next/image. Acceptable for Blob/preview URLs, but missing explicit `width`/`height` causes CLS on slow networks. | 1.4.10 Reflow / CLS | DEFER to Sprint 3 — add explicit `width`/`height` props or wrap in `aspect-*` containers (most already have aspect wrappers; verify ResultCard hero). |

### MEDIUM (sprint 3 backlog)

| # | File:Line | Issue | Notes |
|---|---|---|---|
| M1 | `components/admin/ModerationTable.tsx:184` | `min-w-[860px]` table forces horizontal scroll at 375px. Approve/Reject buttons reachable only after scroll. | Wrapper has `overflow-x-auto` so functionally usable. Consider stacked card layout on `<md:` for mobile admins. |
| M2 | `app/(admin)/admin/users/page.tsx:163`, `app/(admin)/admin/points/page.tsx:147` | Same pattern: `min-w-[760px]` and `min-w-[860px]` tables. | Same as M1. |
| M3 | `components/shared/LeaderboardTable.tsx:36` | `min-w-[640px]` table — slightly tighter than admin, still scrolls at 375px. | Lower priority; user-facing not admin. |
| M4 | `components/scan/ResultCard.tsx:182` | `grid-cols-1 sm:grid-cols-2` for impact cards — at 375px stacks correctly but dense. | OK as-is, watch text wrap on long Vietnamese strings. |
| M5 | `components/shared/HeroSection.tsx:16` | Hero `text-[clamp(2.75rem,4vw+2rem,6rem)]` — 44px floor at 375px works, but "Shazam cho rác." test only; longer copy might overflow. | Pin to `[clamp(2.25rem,...)]` if copy ever expands. |
| M6 | `components/map/MapPageClient.tsx:68` | `h-[calc(100vh-3.5rem)]` — uses `100vh` not `100svh`. iOS Safari address bar will cause map to jump on scroll. | Switch to `100svh` for iOS stability. |

### LOW (polish)

| # | File:Line | Issue |
|---|---|---|
| L1 | `components/shared/Header.tsx:51` | `<details>/<summary>` user menu is functional but lacks ARIA expanded state on the parent. Modern browsers convey this; old screen readers may not. |
| L2 | `app/globals.css:147` | `prefers-reduced-motion` only disables hero fade-up animations — `BadgeUnlockDialog` confetti still fires. Consider gating `import('canvas-confetti')` on the same media query. |
| L3 | `components/listings/ListingCard.tsx:51` | Material badge uses inline `style={{ backgroundColor: material.color }}` with white text; some material colors (e.g. amber) may dip under 4.5:1. Verify each `MATERIAL_OPTIONS.color`. |
| L4 | `components/scan/EcoScoreCard.tsx:34-45` | 1080×1080 share card uses inline pixel sizes — by design (capture target). Not a responsive issue, but flagged for review. |

## A11y Coverage Stats

- `next/image` usage: **8 files** (Headers, ListingCard, LeaderboardTable, ModerationTable, ListingPage, Profile, LeaderboardPodium, ListingForm). 7 from T2-09 migration + 1 ListingForm preview.
- Files with `aria-label` / `aria-labelledby`: **36 files** (good coverage on dialogs, buttons, icons).
- Files with `<img alt=` (raw): **14 files** — all have alt text or `aria-hidden` siblings.
- Dialogs with `role="dialog"` + `aria-modal="true"`: **7 files** (PhotoGrid, MapPageClient mobile drawer, SchoolPrompt, CookieBanner, ShareDialog, BadgeUnlockDialog, PinPointDialog). All consistent.
- Forms with explicit `<label htmlFor>`: ListingForm, PinPointDialog, ProfileEditForm, SchoolPrompt — all wired.
- `prefers-reduced-motion`: handled in `globals.css` for hero animations only.

## Color Contrast Spot-Check

OKLCH tokens from `app/globals.css`:

| Token | OKLCH | Approx hex | On `--background` (98% L) | Pass? |
|---|---|---|---|---|
| `--foreground` | `0.145 0 0` | ~#252525 | ~14.5:1 | YES (AA) |
| `--muted-foreground` | `0.556 0 0` | ~#808080 | ~4.6:1 | YES (AA body) |
| `--brand-green-deep` | `48% 0.13 160` | ~#1f7a4a | ~5.8:1 | YES |
| `--brand-blue-deep` | `48% 0.13 220` | ~#2768a3 | ~5.5:1 | YES |
| `--brand-green` (70% L) | brand-green | ~#3dbf94 | ~2.1:1 | NO — body text fails. Use `*-deep` variants for text. |
| `--brand-blue` (70% L) | brand-blue | ~#3aa1ed | ~2.6:1 | NO — body text fails. |
| White on `bg-eco-hero-gradient` | white on green/blue 70% L | ~5:1+ | YES (large hero text only) | YES (1.4.3 large text 3:1). |

**Action:** Confirm no body text uses `text-brand-green` / `text-brand-blue` (70% L) directly — search shows only the deep variants are used, which is correct.

## Pre-demo Manual Test Checklist (5-min Chrome DevTools mobile mode)

- [ ] Open Chrome DevTools → Device Toolbar → "iPhone SE" (375×667).
- [ ] **Landing `/`**: Hero headline visible, no horizontal scroll, both CTAs reachable.
- [ ] **Scan `/scan`**: Camera button + gallery button stack vertically; ResultCard image + name reflow.
- [ ] **Listings `/listings`**: Grid collapses to 1 column; cards full-width; material chip + intent chip don't overlap.
- [ ] **Map `/map`**: "Bộ lọc" floating button top-left; tapping opens slide-in drawer (85% width); close X tap-target ≥ 44px.
- [ ] **Listing detail**: Photo grid responsive; lightbox dismiss button visible top-right.
- [ ] **Admin `/admin/moderation`**: Table horizontally scrolls (acceptable); approve/reject buttons reachable after scroll.
- [ ] **Keyboard test**: Tab from page top → first stop must be skip-link. Press Enter → focus jumps past header.
- [ ] **Reduced motion**: DevTools → Rendering → Emulate `prefers-reduced-motion: reduce` → hero text appears without fade.
- [ ] **Zoom 200%**: Body text remains readable; no clipped buttons in admin tables.
- [ ] **Color contrast**: DevTools → Lighthouse → Accessibility audit → contrast score ≥ 90.

## Sprint 3 Recommendations

1. Convert admin tables to mobile card layout under `md:` (M1, M2, M3).
2. Switch `100vh` → `100svh` in MapPageClient to stop iOS jump (M6).
3. Wrap remaining 6 raw `<img>` tags with explicit aspect containers + `width`/`height` to eliminate CLS.
4. Audit `MATERIAL_OPTIONS.color` for white-text contrast — extract any failing color into a "darker text on light bg" pattern (L3).
5. Gate `canvas-confetti` import on `prefers-reduced-motion: no-preference` (L2).
6. Run `axe-core` automated scan in Playwright e2e once a CI runner is wired (currently MOBILE-QA-NOTES.md is the only mobile artifact).

## Inline Fixes Applied This Pass

1. `app/layout.tsx` — added skip-link `<a href="#main-content">` with focus-visible reveal.
2. `app/(app)/layout.tsx` — added `id="main-content"` + `tabIndex={-1}` on the children wrapper.
3. `app/(marketing)/layout.tsx` — same skip-link target.
4. `components/map/VoteButtons.tsx` — bumped tap-size to `min-h-[24px]` and added `focus-visible:ring-2`.
5. `components/listings/ListingForm.tsx` — bumped photo-remove button to `h-7 w-7` and added focus ring.

No supabase/, lib/openai/, or actions/ files modified. No new packages installed.
