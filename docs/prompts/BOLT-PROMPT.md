# BOLT.NEW PROMPT — ReLoop @ TDTU Vibe Coding 2026

> Single prompt to feed into Bolt.new (StackBlitz). Section 0 forces Bolt to confirm WebContainer + external service support BEFORE building. Sections 1-9 = Sprint 1 spec ONLY (iterative — Sprint 2 added later via follow-up prompts). Copy everything from line below.

---

# Build ReLoop Sprint 1 — AI-first Recycling Marketplace (TDTU Vibe Coding 2026)

## Section 0 — Pre-flight WebContainer + service check (TRẢ LỜI TRƯỚC KHI BẮT ĐẦU BUILD)

Trước khi viết bất kỳ dòng code nào, bạn PHẢI xác nhận từng item bên dưới có available trên Bolt.new (WebContainer + integrated services) không. Nếu item nào KHÔNG support hoặc cần workaround, đề xuất alternative cụ thể. Format trả lời: bảng markdown với cột `[Item] | [Bolt supports?] | [Workaround if not]`.

Items cần confirm (Bolt-specific, khác với Lovable):

| # | Item | Mục đích | Concern cụ thể |
|---|---|---|---|
| 1 | Next.js 15+ App Router trong WebContainer | Framework chính | RSC + Server Actions chạy được trong WebContainer? |
| 2 | TypeScript strict mode | Type safety | Compile in-browser performance OK? |
| 3 | Tailwind CSS v3/v4 + shadcn/ui CLI init | Styling | `npx shadcn init` chạy được trong WebContainer terminal? |
| 4 | Supabase external project (NOT local) qua env vars | Backend | WebContainer connect external Supabase URL ngoài StackBlitz? |
| 5 | OpenAI API streaming từ WebContainer Route Handler | AI Vision | fetch() từ WebContainer ra api.openai.com (streaming + vision payload) có rate-limit/CORS issue? |
| 6 | Leaflet + react-leaflet (canvas-based) | Map | Canvas rendering trong WebContainer iframe có quirk SSR/window check không? |
| 7 | Vercel deploy 1-click từ Bolt UI | Production | Bolt's built-in Vercel deploy có set env vars OPENAI_API_KEY + SUPABASE_* tự động không? |
| 8 | Native libs: Sharp, image processing | next/image optimization | WebContainer KHÔNG có native binary — cần `images.unoptimized=true` HOẶC dùng Cloudflare loader? |
| 9 | `browser-image-compression` client-side | Cost optimization | Pure JS lib, OK trong WebContainer? |
| 10 | `html-to-image` cho PNG export (Sprint 2) | Share card | Canvas API trong WebContainer iframe có CORS taint khi load Supabase Storage image? |
| 11 | Vietnamese UTF-8 throughout | Localization | File encoding default UTF-8? |
| 12 | File size cap & project size limit | Project scaffold | Bolt project có giới hạn bao nhiêu files/total size? Migration SQL files (8 files ~50KB) OK? |
| 13 | Persistent terminal session | DB migration runs | `supabase db push` từ WebContainer terminal connect external project được không? |
| 14 | Mobile responsive QA preview | Mobile-first | Bolt preview frame có simulate 375/768/1440 không? |
| 15 | Iteration model | Build flow | Bolt thích full prompt 1 lần hay small prompts cumulative? Tôi prefer iterative (Sprint 1 → review → Sprint 2). |

**Sau khi confirm**: trả lời thêm 4 câu hỏi:
- Cost estimate cho 200 OpenAI Vision Scan/ngày × 21 ngày demo (target dưới $5)?
- Có thể setup env vars trong Bolt: `OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` không? Bolt expose chúng vào Vercel deploy thế nào?
- Migration SQL chạy thế nào — paste vào Supabase SQL Editor (external) hay supabase CLI từ WebContainer?
- Recommended iteration cadence: build từng feature T1-01 → T1-10 và preview deploy mỗi feature, hay build hết Sprint 1 rồi deploy 1 lần?

**ĐỢI tôi confirm trả lời TRƯỚC khi tiếp tục Section 1.** Khi tôi nói "OK proceed", build Sprint 1 sequentially T1-01 → T1-10. KHÔNG build Sprint 2 cho đến khi tôi explicitly request.

---

## Section 1 — Project intent & positioning

**Tên sản phẩm:** ReLoop

**Tagline:** *"Shazam cho rác — chụp một ảnh, biết ngay đồ này tái chế được không, đi đâu, hoặc ai đang cần."*

**Mục tiêu cuộc thi:** TDTU Vibe Coding 2026 — Bảng B (học sinh THPT). Bán kết 16/5, Chung kết 30/5. Sprint 1 này build cho Bán kết.

**Đối tượng:**
- Primary: học sinh THPT VN (16-18 tuổi), Gen Z, mobile-first, môi trường
- Secondary: phụ huynh + giáo viên CLB Môi trường THPT lớn HCM/HN
- Admin: dev team + verified moderators

**3 differentiators:**
1. **AI-first scan-to-action**: chụp 1 ảnh → GPT-4o-mini Vision → loại vật liệu + thời gian phân hủy + Eco Score 1-10 + 3 DIY ideas + gợi ý nơi vứt/bán/cho.
2. **Hai luồng song song**: C2C cho-tặng-trao đổi + B2C bán phế liệu/định vị thu gom trong 1 app.
3. **Map crowdsourced + verified**: User pin → community vote → admin verify (Sprint 2).

**Ngôn ngữ UI:** 100% Vietnamese cho user-facing. English cho config files.

**Brand colors:** gradient `oklch(70% 0.18 160)` (eco green) → `oklch(70% 0.18 220)` (eco blue). Background `oklch(98% 0 0)`.

---

## Section 2 — Technical stack (WebContainer-aware)

```
Frontend:
  - Next.js 15+ App Router (RSC default, Client where needed)
  - TypeScript strict mode
  - Tailwind CSS + shadcn/ui (Button, Card, Input, Dialog, Select, Avatar, Sonner toast, Skeleton, Tabs, Badge)
  - Lucide React icons
  - Mobile-first (test 375/768/1440)
  - Vietnamese throughout

Backend:
  - Supabase EXTERNAL project (chỉ connect qua env vars; NOT local instance trong WebContainer)
  - Postgres 14 tables + RLS on every public table
  - Auth (email magic link + Google OAuth)
  - Storage (2 public buckets: 'listings' + 'scans', 2MB limit)
  - Server Actions với Zod validation
  - Route Handler /api/ai/analyze-image (Sprint 1 scope)

AI:
  - OpenAI gpt-4o-mini với Vision (image_url detail:'low')
  - JSON structured output (response_format: json_object)
  - SHA256 image hash dedup → ai_analyses cache table
  - Rate limit 5/phút/user (in-memory Map)
  - Cost target: $0.0005/scan, dưới $5 cả demo period

Map:
  - Leaflet + react-leaflet@^5 (React 19 compat)
  - OpenStreetMap raw tiles (KHÔNG Google Maps)
  - Dynamic import ssr:false — QUAN TRỌNG cho WebContainer
  - OSM attribution mandatory bottom-right

WebContainer-specific constraints:
  - KHÔNG dùng Sharp (native binary không support) → next.config.ts: `images: { unoptimized: true }` HOẶC Cloudflare loader
  - KHÔNG dùng filesystem persistent storage trong WebContainer → mọi blob lên Supabase Storage
  - Image compression CHỈ client-side qua browser-image-compression (pure JS)
  - Service Worker chỉ enable trong production build, disable trong WebContainer dev preview

Deployment:
  - Vercel via Bolt's built-in deploy button
  - Env vars set trong Bolt UI → propagate vào Vercel project
  - Domain: <bolt-project>.vercel.app default; custom domain optional
```

---

## Section 3 — Database schema reference (request full DDL when ready)

14 tables. Mọi public table BẬT RLS. Dùng `(select auth.uid())` thay `auth.uid()` trong policies (perf optimization).

**Enums (full list — copy as-is):**
```sql
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
```

**Table names (request full DDL từng table khi build T1-02):**
1. `profiles` (id, display_name, avatar_url, role, eco_points, level, bio, city, school, banned_at, banned_reason, timestamps)
2. `material_categories` (code PK, name_vi, name_en, icon, color)
3. `material_info` (code PK FK material_categories, decomposition_years_min/max, impact_score 1-10, recyclable, recycle_methods JSONB, diy_ideas JSONB, source_url)
4. `listings` (id, owner_id, title, description, intent, material_code, condition 1-5, photos text[], lat, lng, city, status, ai_analysis_id, moderation_passed, moderation_reason, moderated_at, view_count, timestamps)
5. `ai_analyses` (id, user_id, image_hash UNIQUE, image_url, model, result JSONB, tokens_input, tokens_output, created_at)
6. `collection_points` (id, name, type, accepts material_code[], lat, lng, address, phone, hours, notes, contributed_by, verified, upvotes, downvotes, created_at)
7. `collection_point_votes` (point_id, user_id, kind, PK composite)
8. `exchanges` (Sprint 2)
9. `messages` (Sprint 2)
10. `eco_actions` (id, user_id, kind, points_delta, ref_table, ref_id, created_at)
11. `badges` (Sprint 2)
12. `user_badges` (Sprint 2)
13. `notifications` (Sprint 2)
14. `analytics_events` (Sprint 2 — PostHog mirror)

**Helper function (Sprint 1 must have):**
```sql
create function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists(select 1 from profiles where id = auth.uid() and role='admin');
$$;
```

**Auto-create profile trigger:** `handle_new_user()` after insert on `auth.users`.

**RPC `increment_points(uid, delta)`** (security definer, service_role only) — atomic eco_points update.

**Extensions:** `cube`, `earthdistance` (geo), `uuid-ossp`.

**RLS strategy (defense-in-depth, critical for rubric 4.1):**
- `profiles`: users update OWN profile EXCLUDING role/eco_points/level columns. Admin có thể update any.
- `listings`: owner update OK BUT `moderation_passed` locked (chỉ admin client thay đổi).
- `eco_actions`: SELECT own only; INSERT via service_role only (no client policy).
- `analytics_events`: admin SELECT only; INSERT via service_role only (Sprint 2).
- `collection_points`: anyone can SELECT verified=true; authenticated users INSERT (verified=false default); admin UPDATE verified flag.

**Seed data (Sprint 1):**
- 16 rows `material_categories` (1 per enum, name_vi tiếng Việt, hex color, lucide icon name).
- 16 rows `material_info` (decomposition years thật từ VnExpress/CECR.vn/Bộ TN&MT — vd: PET 450-1000 năm, lon nhôm 80-100 năm, vỏ chuối 2-6 tuần, túi nilon 10-100 năm).
- 20 starter `collection_points`: 10 HCM + 10 HN, lat/lng accurate, verified=true.
- 10 fake user profiles + 30 demo listings + 50 eco_actions cho rich demo.

**Action item cho bạn:** Khi tôi nói "build T1-02", request đầy đủ DDL từng table và RLS policy SQL chi tiết. KHÔNG đoán schema.

---

## Section 4 — Sprint 1 feature list (10 issues, all P0)

Build sequentially T1-01 → T1-10. Mỗi feature deploy preview lên Vercel để test trước khi tiếp.

**T1-01 — Setup repo**: Next.js scaffold + Tailwind + shadcn/ui init + Supabase project link + Vercel deploy button + GitHub Actions skeleton (lint + typecheck). Hello world live URL trong WebContainer preview + Vercel preview URL.

**T1-02 — DB Migration**: chạy migration `0001_init.sql` external Supabase project (paste vào Supabase SQL Editor HOẶC `supabase db push` từ WebContainer terminal). Tạo 14 tables + RLS + triggers + seed material_categories + material_info. Generate `types/database.types.ts`.

**T1-03 — Auth Supabase**: `/auth/login` với 2 nút "Email magic link" + "Tiếp tục với Google". `/auth/callback` exchange code for session. `middleware.ts` refresh token + route guard `/dashboard`, `/scan`, `/listings/new`, `/profile`, `/admin`. Logout button. Auto-create profile via trigger.

**T1-04 — Landing page**: public route `/` với 5 sections (Hero gradient + headline "Shazam cho rác.", 3 Pillars, How it works, 3 Stats, Footer with OSM attribution). ISR `revalidate=300`. Mobile-first 375/768/1440. Lighthouse mobile ≥ 85.

**T1-05 — Listings CRUD**: Form `/listings/new` với 6 field (title, description, intent, material_code, condition 1-5, city, photos max 5). Server Action `createListing(formData)` validate Zod + upload Supabase Storage `listings` bucket + AI moderation. List `/listings` server component fetch only `moderation_passed=true`. Detail `/listings/[id]` với owner card + "Liên hệ" mailto button. Soft delete via `status='removed'`.

**T1-06 — AI Vision Scan ⭐ CORE (gánh 25/100 điểm Bán kết)**:
- `/scan` page với CameraCapture component (input type=file capture=environment)
- Client compress với browser-image-compression (max 1024px, q=0.8) — pure JS, OK trong WebContainer
- Upload Supabase Storage `scans` bucket
- POST `/api/ai/analyze-image` với `{imageUrl}` — Route Handler fetch openai (verify CORS từ WebContainer cho phép)
- Image hash sha256 cache → ai_analyses table (no double-charge)
- Rate limit 5/min/user (in-memory Map)
- ResultCard render: detected_item h2 + material badge color + decomposition gauge + Eco Score 1-10 ring + 3 DIY ideas + warning đỏ nếu pin/điện tử
- Auto cộng eco_points +5 qua RPC `increment_points` (chỉ on cache miss)
- Graceful fallback nếu `OPENAI_API_KEY` missing → mock result `{material_code:'MIXED', confidence:0}`

**Vision system prompt (Vietnamese):**
```
Bạn là chuyên gia môi trường và tái chế tại Việt Nam. Phân tích ảnh đồ vật người dùng gửi và trả về CHỈ một JSON object hợp lệ, không kèm lời giải thích, không markdown fence.

Schema bắt buộc:
{
  "detected_item": "string ngắn gọn tiếng Việt",
  "material_code": "PET|HDPE|PP|PS|PVC|OTHER_PLASTIC|PAPER|CARDBOARD|GLASS|METAL_AL|METAL_FE|TEXTILE|ELECTRONIC|ORGANIC|BATTERY|MIXED",
  "confidence": 0.0-1.0,
  "decomposition_years_min": int,
  "decomposition_years_max": int|null,
  "environmental_impact_score": 1-10,
  "recyclable": true|false,
  "recycle_suggestions": ["3-5 gợi ý tiếng Việt, mỗi câu < 25 từ"],
  "diy_ideas": ["3 ý tưởng tái chế tại nhà phù hợp HS Việt Nam"],
  "nearby_collection_point_types": ["scrap_dealer","recycle_bin","ngo_dropoff","ewaste","other"],
  "warning": "string|null - cảnh báo nếu pin/điện tử/hóa chất"
}

Quy tắc:
- Nếu ảnh không phải đồ vật/rác → "material_code":"MIXED","confidence":0.0,"warning":"Không nhận diện được vật liệu, vui lòng chụp rõ hơn".
- Số liệu phân hủy dựa trên VnExpress, Bộ TN&MT.
- DIY ideas an toàn cho học sinh, không hóa chất nguy hiểm.
- Tiếng Việt, giọng văn thân thiện Gen Z.
```
Temperature 0.2, max_tokens 800, response_format json_object.

**T1-07 — RLS test 2-user**: document `RLS-TEST-PLAN.md` 12 scenarios. Execute với 2 real users sau deploy.

**T1-08 — Map Leaflet**: `/map` full-screen mobile + sidebar filter desktop với 5 type checkboxes (Vựa phế liệu, Thùng tái chế công cộng, Điểm NGO, Rác điện tử, Khác). **Dynamic import ssr:false BẮT BUỘC** — Leaflet ăn `window`, fail SSR trong WebContainer iframe. OSM tile + attribution. 20 collection_points seed render. Marker color: green=verified / yellow=unverified. Click → popup name/type/accepts/address/phone/hours/votes. "Vị trí của tôi" button gọi geolocation với 10s timeout + permission deny graceful.

**T1-09 — Eco Points + Profile**: RPC `increment_points(uid, delta)` atomic. Server Action `awardPoints(userId, kind, delta)` insert eco_actions + RPC. Hook into createListing (+10), Vision scan (+5 only on cache miss). `/profile` server component show avatar + display_name + eco_points hero number + level + 5 recent eco_actions Vietnamese RTF + 3 stat cards. `/profile/edit` form whitelist display_name/bio/city/avatar_url. Header UserBadge `🌱 {points}`.

**T1-10 — Polish day**: Loading skeletons mọi server fetch (shadcn Skeleton + Suspense). `app/error.tsx` + `global-error.tsx` tiếng Việt. Toast (Sonner) feedback mọi mutation. Mobile QA pass 3 size. Demo seed 30 listings + 10 fake users với eco_points đa dạng. 2 demo accounts. Slide PDF 5 trang. Poster A1 Figma. Tập demo 5 lần với timer ≤ 3 phút. Lighthouse mobile ≥ 85.

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

**Typography:** Geist Sans / Inter, display clamp(2.75rem, 4vw + 2rem, 6rem), body clamp(1rem, 0.9rem + 0.4vw, 1.125rem), mono Geist Mono.

**Component conventions:** shadcn/ui base everywhere; Vietnamese labels; Sonner toast top-center richColors; Skeleton + Suspense per route.

**Anti-patterns avoid:** uniform card grids, stock centered hero, flat layout no depth, gray-on-white, animate width/height/top/left.

---

## Section 6 — Acceptance criteria (Sprint 1 → Bán kết rubric)

| Rubric (Bán kết) | Tính năng gánh điểm |
|---|---|
| 1.1 Chủ đề Môi trường (15đ) | T1-04 Landing + T1-06 AI Scan + T1-08 Map |
| 1.2 Vibe Coding/AI (10đ) | T1-06 AI Scan core + T1-05 AI moderation |
| 2.1 Bố cục responsive (10đ) | T1-04 + T1-08 + T1-05 |
| 2.2 Loading/feedback (10đ) | T1-10 Polish |
| 3.1 Login/Token (10đ) | T1-03 Auth |
| 3.2 DB user/lịch sử (10đ) | T1-02 + T1-09 + T1-05 |
| 4.1 Phân quyền + API bảo vệ (10đ) | T1-03 + T1-07 RLS |
| 4.2 Tốc độ/ổn định (5đ) | T1-01 CI |
| 5.1 Demo ổn định (15đ) | T1-10 |
| 5.2 Phản biện (5đ) | QA-PREP |

Target Sprint 1 → Bán kết: ~92/100.

---

## Section 7 — WebContainer-specific anti-patterns

1. **Sharp/native image lib** → KHÔNG cài; dùng `next.config.ts: { images: { unoptimized: true } }` HOẶC Cloudflare loader.
2. **Local Supabase trong WebContainer** → KHÔNG khả thi; dùng external Supabase project, connect qua env vars.
3. **Filesystem persistent storage** → mọi blob lên Supabase Storage; KHÔNG ghi vào WebContainer FS expect persistence.
4. **SSR Leaflet** → `dynamic(() => import(...), { ssr: false })` BẮT BUỘC; nếu không sẽ crash `window is not defined`.
5. **Service Worker dev** → disable trong dev; bật chỉ production build (next.config conditional).
6. **OPENAI_API_KEY ở client** → CHỈ Route Handler server-side; `grep "OPENAI" client/` phải rỗng.
7. **Demo trên localhost** → CHỈ dùng Vercel production URL lúc demo Bán kết.
8. **AI hallucinate** → temperature=0.2, Zod validate response, UI ưu tiên material_info DB seeded.
9. **OpenAI burn budget** → hard cap, image hash cache, rate limit 5/min, cron alert 80% (Sprint 2).
10. **Storage Supabase đầy** → compress client-side max 1MB, auto-delete listings removed > 30 ngày (Sprint 2 cron).

---

## Section 8 — Output format expected

Folder convention:
```
app/
  (marketing)/page.tsx (landing, ISR 300s)
  (app)/dashboard/page.tsx
  (app)/scan/page.tsx
  (app)/listings/{page,new,[id]}/page.tsx
  (app)/map/page.tsx
  (app)/profile/{page,edit}/page.tsx
  api/ai/analyze-image/route.ts
  auth/{login/page,callback/route}.ts
components/
  ui/ (shadcn primitives)
  shared/ (Header, Footer, HeroSection, PillarCard, StatBlock, UserBadge)
  scan/ (ScanClient, CameraCapture, ResultCard)
  listings/ (ListingCard, PhotoGrid, ListingForm)
  map/ (MapView, MapPageClient, MarkerPopup, FilterSidebar)
  profile/ (EcoPointsBadge, ActivityItem, ProfileEditForm)
lib/
  supabase/{client,server,admin}.ts
  openai/{vision,prompts}.ts
  validators/{listing}.ts
  utils.ts + points.ts + material.ts
actions/
  auth.ts + listings.ts + points.ts + scan.ts + profile.ts
types/database.types.ts
supabase/migrations/0001_init.sql
middleware.ts
README.md + RLS-TEST-PLAN.md
```

---

## Section 9 — Build sequence (iterative)

1. **Confirm Section 0 stack check trước** (return table + 4 answers)
2. Khi tôi gửi "OK proceed", build Sprint 1 sequentially T1-01 → T1-10. **Deploy preview Vercel sau mỗi feature** để test rồi mới qua feature tiếp theo.
3. Sau T1-10 ship full, request review. KHÔNG tự build Sprint 2.
4. Tôi sẽ gửi follow-up prompt cho Sprint 2 (T2-01 → T2-10) sau review.

**Reference repo (Lovable build hoàn chỉnh, dùng cross-check):** https://github.com/toan-vietanhschool/reloop

**Linear board:** https://linear.app/truongvietanh/project/reloop-mvp-tdtu-vibe-coding-2026-cca1b358d64d (TRU-71→90)

---

**END OF PROMPT — bắt đầu Section 0 trả lời WebContainer + service check.**
