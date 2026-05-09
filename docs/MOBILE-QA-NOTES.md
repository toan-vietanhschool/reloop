# Mobile QA Notes — T1-10 Polish

Quick scan against the Sprint 1 surface at `375 / 414 / 768 / 1024`. Everything
shipped in this PR is 320–414px safe.

## Findings

| # | File | Issue | Severity | Status |
| - | ---- | ----- | -------- | ------ |
| 1 | `components/shared/Header.tsx` | The top-bar nav links (`Listings`, `Bản đồ`, `Leaderboard`) were `hidden md:flex` but never echoed into the user dropdown menu. Mobile users had no way to reach the three primary product surfaces. | HIGH | **Fixed** in this PR — dropdown now renders nav links inside an `md:hidden` block. |
| 2 | `components/scan/CameraCapture.tsx` | Camera + gallery buttons use `flex-col gap-3 sm:flex-row`. | OK | No change — already responsive. |
| 3 | `components/scan/ResultCard.tsx` | Image + meta column use `flex-col gap-4 sm:flex-row`. Stats grid uses `grid-cols-1 sm:grid-cols-3`. | OK | No change. |
| 4 | `components/listings/ListingForm.tsx` | All form rows wrap with `grid gap-4 sm:grid-cols-2`. Photo grid uses `grid-cols-3 sm:grid-cols-5`. | OK | No change. |
| 5 | `components/map/MapPageClient.tsx` | Desktop sidebar `hidden md:flex`, mobile shows a drawer (`fixed inset-0 z-[1000]`) with `Filter` trigger button. Drawer width is `w-[85%] max-w-sm`. | OK | No change. |
| 6 | `app/(app)/listings/[id]/page.tsx` | Detail uses `grid gap-8 md:grid-cols-[3fr_2fr]` — collapses to 1 col on mobile. | OK | No change. |
| 7 | `app/(app)/dashboard/page.tsx` | Tile grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`. | OK | No change. |
| 8 | `app/(marketing)/page.tsx` | Pillar / step / stat sections use `grid gap-5 md:grid-cols-3`. Headlines use `text-3xl sm:text-4xl md:text-5xl`. | OK | No change. |
| 9 | `app/error.tsx` (new) | `flex flex-col gap-3 sm:flex-row` for the action buttons. | OK | Designed mobile-first. |

## Manual smoke checklist (run on real device or Chrome DevTools)

- [ ] iPhone SE (375x667) — landing scrolls cleanly, hero CTA reachable.
- [ ] iPhone SE — header dropdown lists all 3 nav links + Hồ sơ + Dashboard + Đăng xuất.
- [ ] iPhone SE — `/scan` camera trigger fills 100% width, no horizontal scroll.
- [ ] iPhone SE — `/listings` cards single column, photos crop cleanly.
- [ ] iPhone SE — `/map` shows the floating "Bộ lọc" pill, drawer slides from the right.
- [ ] iPhone SE — `/profile` activity feed wraps without overflow.
- [ ] Pixel 7 (412x915) — same as above + verify 4 stat cards do not bunch.
- [ ] iPad mini (768x1024) — hero adopts 3-column pillars at the `md` breakpoint.

## Deferred items

None. The single HIGH-severity fix landed in this PR.
