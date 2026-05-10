# LOVABLE PROMPT — ReLoop @ TDTU Vibe Coding 2026

> Single prompt to feed into Lovable.dev. Section 0 forces Lovable to confirm stack support BEFORE building. Sections 1-9 = full spec. Copy everything from line below.

---

# Build ReLoop — AI-first Recycling Marketplace (TDTU Vibe Coding 2026)

## Section 0 — Pre-flight stack check (TRẢ LỜI TRƯỚC KHI BẮT ĐẦU BUILD)

Trước khi viết bất kỳ dòng code nào, bạn PHẢI xác nhận từng item bên dưới có available trên Lovable platform của tôi không. Nếu item nào KHÔNG support, đề xuất alternative cụ thể HOẶC nói rõ "không thể build feature X". Format trả lời: bảng markdown với cột `[Stack item] | [Lovable supports?] | [Alternative if not]`.

Stack items cần confirm:

| # | Stack item | Mục đích |
|---|---|---|
| 1 | Next.js 15+ App Router (RSC + Server Actions) | Framework chính |
| 2 | TypeScript strict mode | Type safety |
| 3 | Tailwind CSS v3 hoặc v4 + shadcn/ui | Styling + component library |
| 4 | Supabase (Postgres + Auth + Storage + Realtime + RLS) | Backend-as-a-Service |
| 5 | OpenAI API (gpt-4o-mini với Vision capability) | AI Image analysis |
| 6 | Leaflet + OpenStreetMap (free, no API key) | Map rendering |
| 7 | Vercel deployment với env vars + Cron | Production hosting |
| 8 | PostHog (analytics) + Sentry (error tracking) | Observability |
| 9 | Playwright + Vitest | Testing framework |
| 10 | GitHub Actions CI/CD | Automated checks on PR |
| 11 | Zod schema validation | Input validation |
| 12 | `@supabase/ssr` cho cookie-based auth | Session management |
| 13 | `browser-image-compression` cho client-side image resize | Cost optimization |
| 14 | `html-to-image` cho PNG export | Share card feature |
| 15 | `canvas-confetti` cho badge unlock animation | Gamification UX |
| 16 | Vietnamese UTF-8 throughout | Localization |
| 17 | Mobile-first responsive (test 375px, 768px, 1440px) | Mobile-first |

**Sau khi confirm**: trả lời thêm 3 câu hỏi:
- Cost estimate cho 200 AI Vision Scan/ngày × 21 ngày? (target: dưới $5)
- Có thể setup environment variables: `OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` không?
- Database schema có thể chạy migration SQL trực tiếp được không, hay phải dùng Lovable's visual schema builder?

**ĐỢI tôi confirm trả lời của bạn TRƯỚC khi tiếp tục Section 1.** Nếu tôi nói "OK proceed" thì bắt đầu build theo thứ tự Sprint 1 → Sprint 2 dưới đây.

---

## Section 1 — Project intent & positioning

**Tên sản phẩm:** ReLoop

**Tagline:** *"Shazam cho rác — chụp một ảnh, biết ngay đồ này tái chế được không, đi đâu, hoặc ai đang cần."*

**Mục tiêu cuộc thi:** TDTU Vibe Coding 2026 — Bảng B (học sinh THPT). Bán kết 16/5, Chung kết 30/5. Mục tiêu Top 1 Bảng B + giải Poster Bình chọn.

**Đối tượng người dùng:**
- **Primary**: học sinh THPT Việt Nam (16-18 tuổi), Gen Z, mobile-first, quan tâm môi trường
- **Secondary**: phụ huynh + giáo viên CLB Môi trường tại các trường THPT lớn HCM/HN
- **Admin**: đội ngũ phát triển + verified moderators

**3 differentiators (KHÔNG ai có cùng lúc trên thị trường VN):**
1. **AI-first scan-to-action**: chụp 1 ảnh → GPT-4o Vision trả ngay (a) loại vật liệu, (b) thời gian phân hủy, (c) Eco Impact Score 1-10, (d) 3 ý tưởng DIY tái chế cá nhân hóa, (e) gợi ý nơi vứt/bán/cho.
2. **Hai luồng song song trong 1 app**: vừa C2C cho-tặng-trao đổi (như Olio) vừa B2C bán phế liệu/định vị điểm thu gom (như VECA). User chọn intent theo từng món đồ.
3. **Map crowdsourced + verified**: User pin điểm thu gom mới, cộng đồng upvote/downvote, admin verify. Khác hoàn toàn map tĩnh do BTC nhập của các app khác (mGreen, VECA).
4. **Gamification cho Gen Z VN**: Eco Score share được lên Facebook/Instagram qua PNG card 1080×1080, leaderboard theo trường THPT, badges + confetti popup.

**Ngôn ngữ UI:** 100% Vietnamese cho user-facing (UI, error messages, toast). English OK cho technical config files.

**Brand colors:** gradient `oklch(70% 0.18 160)` (eco green) → `oklch(70% 0.18 220)` (eco blue). Không vàng/đỏ. Background: `oklch(98% 0 0)` (off-white).

---

## Section 2 — Technical stack (production-grade)

```
Frontend:
  - Next.js 15+ App Router (Server Components default, Client where needed)
  - TypeScript strict mode
  - Tailwind CSS + shadcn/ui (Button, Card, Input, Dialog, Select, Avatar, Toast/Sonner, Skeleton, Tabs, Badge)
  - Lucide React icons
  - Mobile-first responsive (test 375 / 768 / 1440)
  - Vietnamese throughout

Backend:
  - Supabase Postgres (14 tables + RLS on every public table)
  - Supabase Auth (email magic link + Google OAuth)
  - Supabase Storage (2 public buckets: 'listings' + 'scans', 2MB limit)
  - Supabase Realtime (badge unlocks subscribe)
  - Server Actions với Zod validation
  - Route Handlers cho /api/ai/analyze-image + /api/cron/leaderboard

AI:
  - OpenAI gpt-4o-mini với Vision (image_url detail:'low' cho cost)
  - JSON structured output (response_format: json_object)
  - System prompt > 1024 tokens để hit prompt cache
  - SHA256 image hash dedup → cache table 'ai_analyses'
  - Rate limit 5 requests/phút/user (in-memory Map cho MVP)
  - Cost target: $0.0005/scan, dưới $5 cho cả demo period

Map:
  - Leaflet + react-leaflet@^5 (React 19 compat)
  - OpenStreetMap raw tiles (KHÔNG Google Maps)
  - Dynamic import với ssr:false
  - OSM attribution mandatory bottom-right

Observability:
  - PostHog browser SDK + posthog-node server SDK
  - 11 custom events (signup_completed, scan_started, scan_success, scan_failed, listing_created, listing_viewed, point_pinned, vote_cast, badge_unlocked, share_clicked, cta_clicked)
  - Sentry @sentry/nextjs (3 runtimes: client/server/edge)
  - Web Vitals via useReportWebVitals
  - Release tagging via VERCEL_GIT_COMMIT_SHA

CI/CD:
  - GitHub Actions: 5 jobs parallel (lint, typecheck, build, unit, e2e)
  - Playwright cho E2E (3 browsers: Chromium, Firefox, WebKit)
  - Vitest cho unit (>= 80% coverage on tested files)
  - PR template với "AI prompts used" section

Deployment:
  - Vercel (production)
  - Vercel Cron hourly cho leaderboard recompute
  - Env vars: SUPABASE_*, OPENAI_API_KEY, POSTHOG_*, SENTRY_*, CRON_SECRET, POSTHOG_WEBHOOK_SECRET
```

---

## Section 3 — Database schema (Postgres + RLS)

14 tables. Mọi public table BẬT RLS. Dùng `(select auth.uid())` thay `auth.uid()` trong policies (perf optimization).

```sql
-- Enums
create type user_role as enum ('user', 'admin');
create type listing_status as enum ('available','reserved','completed','removed');
create type listing_intent as enum ('give','exchange','sell_scrap','seek');
create type material_code as enum (
  'PET','HDPE','PP','PS','PVC','OTHER_PLASTIC',
  'PAPER','CARDBOARD','GLASS','METAL_AL','METAL_FE',
  'TEXTILE','ELECTRONIC','ORGANIC','BATTERY','MIXED'
);
create type point_type as enum ('scrap_dealer','recycle_bin','ngo_dropoff','ewaste','other');
create type vote_kind as enum ('up','down');

-- Tables (column lists shortened — request full DDL nếu cần):
profiles (id, display_name, avatar_url, role, eco_points, level, bio, city, school, banned_at, banned_reason, created_at, updated_at)
material_categories (code PK, name_vi, name_en, icon, color)
material_info (code PK FK material_categories, decomposition_years_min, decomposition_years_max, impact_score 1-10, recyclable, recycle_methods JSONB, diy_ideas JSONB, source_url)
listings (id, owner_id, title, description, intent, material_code, condition 1-5, photos text[], lat, lng, city, status, ai_analysis_id, moderation_passed, moderation_reason, moderated_at, view_count, created_at, updated_at)
ai_analyses (id, user_id, image_hash UNIQUE, image_url, model, result JSONB, tokens_input, tokens_output, created_at)
collection_points (id, name, type, accepts material_code[], lat, lng, address, phone, hours, notes, contributed_by, verified, upvotes, downvotes, created_at)
collection_point_votes (point_id, user_id, kind, created_at, PK(point_id, user_id))
exchanges (id, listing_id, giver_id, receiver_id, status, meeting_note, rated_by_*, created_at, completed_at)
messages (id, exchange_id, sender_id, body, created_at)
eco_actions (id, user_id, kind, points_delta, ref_table, ref_id, created_at)
badges (code PK, name_vi, description, icon, points_required)
user_badges (user_id, badge_code, awarded_at, PK(user_id, badge_code))
notifications (id, user_id, kind, title, body, link, read_at, created_at)
analytics_events (id, user_id, event, properties JSONB, created_at)

-- Helper function
create function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from profiles where id = auth.uid() and role='admin');
$$;

-- Trigger: auto-create profile on signup
create function public.handle_new_user() returns trigger ...
create trigger on_auth_user_created after insert on auth.users for each row execute function handle_new_user();

-- RPC: atomic increment_points (security definer, service_role only)
create function public.increment_points(uid uuid, delta int) returns void ...

-- RPC: badge award helper
create function public.check_and_award_badge(uid uuid, badge_code text) returns boolean ...

-- Trigger: auto-update vote counts
create function update_cp_vote_counts() returns trigger ...
```

Extensions cần: `cube`, `earthdistance` (cho geo distance queries), `uuid-ossp`.

**RLS policies** đặc biệt quan trọng (defense-in-depth):
- `profiles`: users update own profile EXCLUDING role/eco_points/level columns. Admin can update any.
- `listings`: owner update OK BUT moderation_passed locked (only admin client can change)
- `eco_actions`: SELECT own only; INSERT via service_role only (no client policy)
- `analytics_events`: admin SELECT only; INSERT via service_role only

**Seed data:**
- 16 rows `material_categories` (1 per enum value, name_vi tiếng Việt, hex color, lucide icon)
- 16 rows `material_info` với decomposition_years thật (Chai PET 450-1000 năm; Lon nhôm 80-100 năm; Vỏ chuối 2-6 tuần; Túi nilon 10-100 năm; Thủy tinh ~1M; etc. — source: VnExpress, CECR.vn, Bộ TN&MT)
- 5 starter `badges`: first_scan, plastic_hunter_10, map_contributor, generous_giver, eco_streak_7
- 20 starter `collection_points`: 10 HCM (Q1, Q3, Q5, Q7, BT, PN, TB, GV, TĐ) + 10 HN (Hoàn Kiếm, Ba Đình, Đống Đa, Cầu Giấy, Hai Bà Trưng) — lat/lng accurate, verified=true
- 12 schools rows: THPT chuyên Lê Hồng Phong, THPT Lê Quý Đôn, THPT chuyên Trần Đại Nghĩa, THPT Nguyễn Thượng Hiền, THPT Gia Định, THPT Nguyễn Du, THPT chuyên Nguyễn Huệ HN, THPT Chu Văn An, THPT chuyên Hà Nội-Amsterdam, THPT Phan Đình Phùng, THPT Việt Đức, THPT Lý Thường Kiệt + "Trường khác"
- 10 fake user profiles + 30 demo listings + 50 eco_actions cho rich demo

---

## Section 4 — Feature list (20 issues, prioritized)

Build theo thứ tự này (Tier 1 trước Bán kết 16/5, Tier 2 trước Chung kết 30/5):

### TIER 1 — Sprint Bán kết (10 features, MUST-HAVE)

**T1-01 — Setup repo** (P0): Next.js scaffold + Tailwind + shadcn/ui init + Supabase project link + Vercel deploy + GitHub Actions CI skeleton (lint + typecheck). Hello world live URL.

**T1-02 — DB Migration** (P0): chạy migration 0001_init.sql tạo 14 tables + RLS + triggers + seed material_categories + material_info. Generate TypeScript types.

**T1-03 — Auth Supabase** (P0): /auth/login với 2 nút "Email magic link" + "Tiếp tục với Google". /auth/callback exchange code for session. middleware.ts (hoặc proxy.ts cho Next 16) refresh token + route guard `/dashboard`, `/scan`, `/listings/new`, `/profile`, `/admin`. Logout button. Auto-create profile via trigger.

**T1-04 — Landing page** (P0): public route `/` với 5 sections (Hero gradient + headline "Shazam cho rác.", 3 Pillars, How it works, 3 Stats, Footer with OSM attribution). ISR `revalidate=300`. Mobile-first 375/768/1440. Lighthouse mobile ≥ 85.

**T1-05 — Listings CRUD** (P0): Form `/listings/new` với 6 field (title, description, intent, material_code, condition 1-5, city, photos max 5). Server Action `createListing(formData)` validate Zod + upload Supabase Storage `listings` bucket + AI moderation. List `/listings` server component fetch only `moderation_passed=true`. Detail `/listings/[id]` với owner card + "Liên hệ" mailto button. Soft delete via status='removed'.

**T1-06 — AI Vision Scan** (P0, ⭐ CORE — gánh 25/100 điểm Bán kết):
- `/scan` page với CameraCapture component (input type=file capture=environment)
- Client compress với browser-image-compression (max 1024px, q=0.8)
- Upload Supabase Storage `scans` bucket
- POST `/api/ai/analyze-image` với `{imageUrl}`
- Image hash sha256 cache → ai_analyses table (no double-charge)
- Rate limit 5/min/user
- ResultCard render đẹp: detected_item h2 + material badge color + decomposition gauge + Eco Score 1-10 ring + 3 DIY ideas + warning đỏ nếu pin/điện tử
- Auto cộng eco_points +5 qua RPC increment_points (chỉ on cache miss)
- Graceful fallback nếu OPENAI_API_KEY missing → mock result `{material_code:'MIXED', confidence:0}`

**Vision system prompt** (Vietnamese):
```
Bạn là chuyên gia môi trường và tái chế tại Việt Nam. Phân tích ảnh đồ vật người dùng gửi và trả về CHỈ một JSON object hợp lệ, không kèm lời giải thích, không markdown fence.

Schema bắt buộc:
{
  "detected_item": "string ngắn gọn tiếng Việt (vd: 'Chai nước nhựa PET 500ml')",
  "material_code": "PET|HDPE|PP|PS|PVC|OTHER_PLASTIC|PAPER|CARDBOARD|GLASS|METAL_AL|METAL_FE|TEXTILE|ELECTRONIC|ORGANIC|BATTERY|MIXED",
  "confidence": 0.0-1.0,
  "decomposition_years_min": int,
  "decomposition_years_max": int|null,
  "environmental_impact_score": 1-10,
  "recyclable": true|false,
  "recycle_suggestions": ["3-5 gợi ý tiếng Việt, mỗi câu < 25 từ"],
  "diy_ideas": ["3 ý tưởng tái chế tại nhà phù hợp HS Việt Nam"],
  "nearby_collection_point_types": ["scrap_dealer","recycle_bin","ngo_dropoff","ewaste","other"],
  "warning": "string|null - cảnh báo nếu là rác nguy hại (pin, điện tử, hóa chất)"
}

Quy tắc:
- Nếu ảnh không phải đồ vật/rác → trả "material_code":"MIXED","confidence":0.0,"warning":"Không nhận diện được vật liệu, vui lòng chụp rõ hơn".
- Số liệu phân hủy dựa trên tài liệu môi trường VN (VnExpress, Bộ TN&MT).
- DIY ideas phải an toàn cho học sinh, không yêu cầu hóa chất nguy hiểm.
- Luôn dùng tiếng Việt, giọng văn thân thiện Gen Z.
```
Temperature 0.2, max_tokens 800, response_format json_object.

**T1-07 — RLS test 2-user** (P0): document `RLS-TEST-PLAN.md` với 12 scenarios. Execute với 2 real users sau deploy.

**T1-08 — Map Leaflet** (P0): `/map` full-screen mobile + sidebar filter desktop với 5 type checkboxes (scrap_dealer="Vựa phế liệu", recycle_bin="Thùng tái chế công cộng", ngo_dropoff="Điểm NGO", ewaste="Rác điện tử", other="Khác"). Dynamic import Leaflet ssr:false. OSM tile + attribution. 20 collection_points seed render. Marker color: green=verified / yellow=unverified. Click → popup name/type/accepts/address/phone/hours/votes. "Vị trí của tôi" button gọi geolocation với 10s timeout + permission deny graceful.

**T1-09 — Eco Points + Profile** (P0): RPC `increment_points(uid, delta)` atomic security definer. Server Action `awardPoints(userId, kind, delta)` insert eco_actions + RPC. Hook into createListing (+10), Vision scan (+5 only on cache miss). `/profile` server component show avatar + display_name + eco_points hero number + level + 5 recent eco_actions với Vietnamese RTF + 3 stat cards (scan/listing/vote). `/profile/edit` form whitelist display_name/bio/city/avatar_url. Header UserBadge `🌱 {points}`.

**T1-10 — Polish day** (P0): Loading skeletons mọi server fetch (shadcn Skeleton + Suspense). app/error.tsx + global-error.tsx tiếng Việt. Toast (Sonner) feedback mọi mutation. Mobile QA pass 3 size. Demo seed 30 listings + 10 fake users với eco_points đa dạng. 2 demo accounts. Slide PDF 5 trang. Poster A1 Figma. Tập demo 5 lần với timer ≤ 3 phút. Lighthouse mobile ≥ 85.

### TIER 2 — Sprint Chung kết (10 features, NICE-TO-HAVE)

**T2-01 — Pin collection points** (P1): User logged-in pin điểm mới → form Zod validate → insert verified=false → +15 eco_points. Marker yellow until admin verify. VoteButtons thumbs-up/down upsert collection_point_votes (PK enforce 1 vote/user/point). Trigger auto-update upvotes/downvotes counts. `/admin/points` admin verify list ordered by upvotes DESC.

**T2-02 — Leaderboard + school filter** (P1): Migration 0005 thêm `profiles.school` + tạo `schools` table với 12 THPT seed. `/leaderboard` PUBLIC (no auth gate) ISR `revalidate=60`. Top 3 podium gold/silver/bronze + table 4-20 + SchoolFilter dropdown URL state `?school=CODE`. Onboarding SchoolPrompt prompt user chọn trường lần login đầu (skippable). Vercel Cron `/api/cron/leaderboard` hourly với `Authorization: Bearer ${CRON_SECRET}`.

**T2-03 — Badges 5 starter** (P1): SQL function `check_and_award_badge`. `actions/badges.ts:checkBadges(userId, kind)` filter rules → check condition → insert user_badges on conflict do nothing → log notifications. Hook into awardPoints. BadgeGrid trên profile (5-cell, locked grayscale + progress text "3/10"). BadgeUnlockDialog Realtime subscribe user_badges INSERT → confetti popup (canvas-confetti dynamic import) + "Khoe lên Facebook" button (FB share intent).
Rules:
- first_scan: count(eco_actions kind='scan') ≥ 1
- plastic_hunter_10: count(scan với material_code in plastic enum) ≥ 10
- map_contributor: count(collection_points contributed_by=user AND verified=true) ≥ 1
- generous_giver: count(listings owner_id=user AND intent='give' AND status='completed') ≥ 5
- eco_streak_7: distinct dates in last 7 days với eco_action ≥ 7

**T2-04 — Admin moderation panel** (P1): `app/(admin)/layout.tsx` server-side `is_admin()` check redirect non-admin. `/admin/moderation` 3 tabs (Listings pending / Collection Points unverified / Users flagged). ModerationTable bulk select với Approve/Reject all. approveListings/rejectListings/banUser server actions audit log via eco_actions kind='admin_*'. Migrations 0007 add `moderation_reason`, `moderated_at` to listings; 0008 add `banned_at`, `banned_reason` to profiles.

**T2-05 — PostHog analytics** (P1, gánh TC8 10đ): `lib/analytics.ts` browser wrapper + `lib/analytics-server.ts` server wrapper. `<PostHogProvider>` mount root layout. `<PageviewTracker>` $pageview on usePathname change. `<CookieBanner>` GDPR opt-out default. 11 custom events instrumented inline. Mirror critical events vào Postgres `analytics_events` (server-side) cho on-prem queries. PostHog dashboard 3 panels: DAU, Funnel scan_started→scan_success→listing_created, Top events 7d.

**T2-06 — GitHub Actions CI/CD** (P1, gánh TC9 10đ): `.github/workflows/ci.yml` 5 jobs parallel (lint/typecheck/build/unit/e2e). Each < 3 min, total < 8 min. Playwright config 3 browsers, install --with-deps chromium, screenshot on failure, video retain-on-failure, trace on first retry. webServer auto-start `pnpm start` in CI. Concurrency cancel-in-progress. Status badge in README. PR template với "AI prompts used" section.

**T2-07 — Sentry** (P1, gánh TC9 10đ): @sentry/nextjs install. 3 config files (client/server/edge). instrumentation.ts register + onRequestError. withSentryConfig wrap next.config với hideSourceMaps + widenClientFileUpload. PII scrub trong beforeSend (delete email, ip_address). beforeSend drop expected errors (rate_limited, unauthorized). Web Vitals via useReportWebVitals → Sentry.captureEvent. Release tag `VERCEL_GIT_COMMIT_SHA.slice(0,7)`. Test trigger `/__sentry-test` admin-only page.

**T2-08 — Share Eco Score Card** (P1, viral hook cho Poster Award): Sau scan thành công, button "Chia sẻ kết quả 📸" → `<ShareDialog>` với preview 1080×1080 EcoScoreCard. Card design: gradient brand colors, top-left scan image (rounded 16, 320×320), top-right ReLoop logo, headline "Tôi vừa cứu Trái Đất khỏi {detected_item} — sống lâu hơn ông cố tôi {years} đời 🤯", center Eco Score gauge {score}/10 với emoji 🌱→🔥, material badge, badge unlocked chip, bottom-right QR code + "reloop.app" watermark. 3 share actions: Download PNG (html-to-image toBlob pixelRatio 2 cacheBust), Web Share API mobile (navigator.share files), Facebook share intent. Auto-generate Vietnamese caption "Tôi vừa scan {item}, sống lâu hơn ông cố tôi {years} đời 🤯 Eco Score {score}/10. Bạn thử xem? reloop.app". Track event share_clicked.

**T2-09 — Performance audit** (P2, gánh TC7 10đ): Bundle analyzer wired (@next/bundle-analyzer). All `<img>` → `next/image` với explicit width/height + priority for hero + lazy below-fold. Supabase Storage domain trong next.config images.remotePatterns. Dynamic imports verified (Leaflet, html-to-image, canvas-confetti, posthog-node). ISR tuning: landing 300s, listings 120s, map 300s, leaderboard 60s, scan/profile dynamic. OpenAI prompt caching active (system prompt ≥ 1024 tokens, dynamic content cuối). Image compression client-side max 1MB 1024px web worker. Targets: Landing First Load JS < 150kb gzip, app pages < 300kb. Lighthouse mobile ≥ 90 trên `/`, ≥ 85 các route khác.

**T2-10 — Pitch deck Chung kết** (P0, gánh TC10 + 5.1): 10-slide pitch deck PDF (Cover/Problem/WhyNow/Solution/DemoLIVE3min/TechArchitecture/AICollaboration/AnalyticsOps/Roadmap/Closing). 7-min demo script second-by-second. DB backup snapshot pre-final manual via Supabase dashboard. Plan B (network down → 90s recording video offline). Plan C (OpenAI down → cached scan response screenshot). Plan D (Supabase down → mock HTML hardcoded). Pre-demo T-1h checklist (laptop sạc, adapter HDMI, 5 tab mở sẵn, hotspot 4G, chai nhựa thật + lon nhôm + báo cũ). 7 BGK Q&A scripted Vietnamese.

---

## Section 5 — Design system

**Colors (Tailwind v4 @theme inline OR CSS vars):**
```css
:root {
  --color-brand-green: oklch(70% 0.18 160);
  --color-brand-blue: oklch(70% 0.18 220);
  --color-eco-bg: oklch(98% 0 0);
  --color-eco-bg-soft: oklch(95% 0.01 160);
  --color-text: oklch(18% 0 0);
  --color-text-muted: oklch(45% 0 0);
  --eco-hero-gradient: linear-gradient(135deg, var(--color-brand-green), var(--color-brand-blue));
  --duration-fast: 150ms;
  --duration-normal: 300ms;
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
}
```

**Typography:**
- Display headings: Geist Sans / Inter, clamp(2.75rem, 4vw + 2rem, 6rem)
- Body: Geist Sans / Inter, clamp(1rem, 0.9rem + 0.4vw, 1.125rem)
- Mono (codes/IDs): Geist Mono / JetBrains Mono

**Spacing rhythm:** Tailwind defaults với clamp on section padding `py-clamp(4rem, 3rem+5vw, 10rem)`.

**Component conventions:**
- shadcn/ui base everywhere
- Vietnamese labels on all buttons/forms
- Toast top-center via Sonner with richColors
- Loading: shadcn Skeleton + Suspense boundaries per route

**Anti-patterns to avoid (per ECC web rules):**
- Default card grids with uniform spacing → use bento with hierarchy
- Stock hero with centered headline + gradient blob → use editorial composition
- Flat layout no depth → add shadows/overlap/subtle motion
- Safe gray-on-white → opinionated brand palette
- Animate width/height/top/left → only transform/opacity/clip-path

**Performance budget:**
- Animate compositor-friendly properties only
- prefers-reduced-motion guard wrap CSS keyframes
- next/image với explicit dimensions + priority hero
- Max 2 font families
- font-display: swap

---

## Section 6 — Acceptance criteria + rubric mapping

Mỗi feature gánh ≥1 tiêu chí rubric. Project target: Bán kết ~92/100, Chung kết ~94/100.

| Rubric (Bán kết) | Tính năng gánh điểm |
|---|---|
| 1.1 Chủ đề Môi trường (15đ) | T1-04 Landing + T1-06 AI Scan + T1-08 Map + T2-01 Pin |
| 1.2 Vibe Coding/AI (10đ) | T1-06 AI Scan core + T1-05 AI moderation |
| 2.1 Bố cục responsive (10đ) | T1-04 Landing + T1-08 Map + T1-05 Listings grid |
| 2.2 Loading/feedback (10đ) | T1-10 Polish skeletons + Sonner toasts |
| 3.1 Login/Token (10đ) | T1-03 Auth Supabase |
| 3.2 DB lưu user/lịch sử/giao dịch (10đ) | T1-02 Schema + T1-09 Eco Points + T1-05 Listings |
| 4.1 Phân quyền + bảo vệ API (10đ) | T1-03 + T1-07 RLS + T2-04 Admin |
| 4.2 Tốc độ/ổn định (5đ) | T1-01 CI skeleton + T2-09 Perf |
| 5.1 Demo ổn định (15đ) | T1-10 Polish + T2-10 Pitch deck |
| 5.2 Phản biện (5đ) | QA-PREP + Roadmap |

| Rubric (Chung kết) | Tính năng gánh điểm |
|---|---|
| TC1 Giao diện (10đ) | T1-04 + T2-09 |
| TC2 UX (10đ) | T1-10 + T2-08 Share |
| TC3 Logic (10đ) | T1-09 Points + T2-02 Leaderboard + T2-03 Badges |
| TC4 Backend/API (10đ) | T1-05 + T1-06 + T2-01 + T2-04 |
| TC5 DB (10đ) | T1-02 14 tables + 8 migrations |
| TC6 Bảo mật (10đ) | T1-07 RLS + T2-04 Admin + T2-07 PII scrub |
| TC7 Hiệu năng (10đ) | T2-09 Lighthouse + ISR + cache |
| **TC8 Analytics (10đ)** | **T2-05 PostHog** ⭐ |
| **TC9 Vận hành (10đ)** | **T2-06 CI + T2-07 Sentry** ⭐ |
| TC10 Chiến lược SP (10đ) | T2-10 Pitch + Differentiators |

---

## Section 7 — Anti-patterns & rủi ro tránh

(Đọc kỹ — đã được kiểm chứng từ playbook):

1. **Scope creep sau ngày 12/5** → freeze Tier 1
2. **Demo trên localhost** → CHỈ mở URL Vercel production lúc demo
3. **Google Maps API tốn tiền/lộ key** → dùng Leaflet + OSM (free, no key)
4. **AI hallucinate sai info** → UI ưu tiên material_info DB seeded (Bộ TN&MT), AI chỉ bổ sung DIY; temperature=0.2; Zod validate
5. **API key ở frontend** → `OPENAI_API_KEY` chỉ server-side, `grep "OPENAI" client/` phải rỗng
6. **RLS thiếu** → test 2-user qua DevTools, Supabase dashboard không cảnh báo đỏ
7. **Loading state thiếu** → shadcn Skeleton + Suspense + useTransition + toast.loading mọi mutation
8. **Mobile responsive bỏ qua** → Tailwind mobile-first, test 375 / 414 / 768 / 1440
9. **OpenAI burn budget** → hard cap `OPENAI_MONTHLY_USD=10`, cron alert 80%, image hash cache, rate limit 5/min
10. **Storage Supabase đầy** → compress client-side max 1MB, auto-delete listings removed > 30 ngày

---

## Section 8 — Output format expected

Khi build, tổ chức theo folder convention:
```
app/
  (marketing)/page.tsx (landing, ISR 300s)
  (marketing)/leaderboard/page.tsx (ISR 60s)
  (app)/dashboard/page.tsx
  (app)/scan/page.tsx
  (app)/listings/{page,new,[id]}/page.tsx
  (app)/map/page.tsx
  (app)/profile/{page,edit}/page.tsx
  (admin)/admin/{moderation,points,users}/page.tsx
  api/ai/analyze-image/route.ts
  api/cron/leaderboard/route.ts
  api/webhooks/posthog/route.ts
  auth/{login/page,callback/route}.ts
components/
  ui/ (shadcn primitives)
  shared/ (Header, Footer, HeroSection, PillarCard, StatBlock, UserBadge, PostHogProvider, CookieBanner, BadgeUnlockDialog, LeaderboardPodium, LeaderboardTable, SchoolFilter, WebVitalsReporter)
  scan/ (ScanClient, CameraCapture, ResultCard, EcoScoreCard, ShareDialog, QRCode, Skeleton)
  listings/ (ListingCard, PhotoGrid, ListingForm, ListingViewTracker)
  map/ (MapView, MapPageClient, MarkerPopup, PinPointDialog, VoteButtons, FilterSidebar)
  profile/ (BadgeGrid, EcoPointsBadge, ActivityItem, ProfileEditForm)
  admin/ (AdminHeader, AdminTabs, ModerationTable, BulkActionBar, BanUserButton)
  onboarding/ (SchoolPrompt)
lib/
  supabase/{client,server,admin}.ts
  openai/{vision,prompts,moderate}.ts
  validators/{listing,collection-point}.ts
  analytics.ts + analytics-server.ts
  share.ts + badge-rules.ts + map-utils.ts + material.ts + utils.ts + points.ts
actions/
  auth.ts + listings.ts + points.ts + collection-points.ts + admin.ts + badges.ts + profile.ts + scan.ts
types/database.types.ts (generated)
supabase/migrations/0001_init.sql ... 0009_*.sql
proxy.ts (Next 16) hoặc middleware.ts
sentry.{client,server,edge}.config.ts + instrumentation.ts
playwright.config.ts + vitest.config.ts + tests/{unit,e2e}/
.github/workflows/ci.yml
README.md + CHANGELOG.md + HANDOFF.md + docs/
```

---

## Section 9 — Build sequence

1. **Confirm Section 0 stack check trước** (return table)
2. Khi tôi gửi "OK proceed", build Sprint 1 sequentially T1-01 → T1-10 (deploy mỗi feature lên Vercel preview để test)
3. Sau Sprint 1 ship full, request review trước khi build Sprint 2
4. Build Sprint 2 sequentially T2-01 → T2-10
5. Final: chạy CI 5/5 green + Lighthouse mobile ≥ 85 + smoke test 4 routes
6. Deploy production Vercel với env vars + domain

**Reference repo (đã build hoàn chỉnh, dùng cho cross-check):** https://github.com/toan-vietanhschool/reloop

**Sample working URLs:**
- Cloudflare worker: https://reloop.vibecode-academy.workers.dev (SSR blocked by upstream bug, dùng để xem static assets only)
- Linear board: https://linear.app/truongvietanh/project/reloop-mvp-tdtu-vibe-coding-2026-cca1b358d64d (20 issues TRU-71→90)

---

**END OF PROMPT — bắt đầu Section 0 trả lời stack check.**
