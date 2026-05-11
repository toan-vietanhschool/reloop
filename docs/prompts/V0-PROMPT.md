# V0.DEV PROMPT PACK — ReLoop @ TDTU Vibe Coding 2026

> **DESIGN-ONLY** prompts for v0.dev (Vercel). v0 generates JSX components — copy output into existing Next.js project at `D:\reloop\` (Lovable/Bolt-built backend). No backend code, no API routes, no database. Pure UI/UX.
>
> **5 sub-prompts** below. Each is copy-paste ready into v0.dev chat input. Each generates 1 component family.

---

## Shared design context (paste at top of EACH v0 prompt as "design system" preamble)

```
DESIGN SYSTEM — ReLoop (Vietnamese recycling marketplace, Gen Z students 16-18):

Brand colors (Tailwind v4 tokens, all generated components MUST use these):
- bg-brand-green = oklch(70% 0.18 160)
- bg-brand-blue  = oklch(70% 0.18 220)
- bg-eco-bg      = oklch(98% 0 0) (off-white background)
- bg-eco-bg-soft = oklch(95% 0.01 160) (subtle green wash)
- text-text      = oklch(18% 0 0) (near-black body)
- text-text-muted= oklch(45% 0 0)
- Hero gradient: bg-gradient-to-br from-brand-green to-brand-blue (135deg)

Typography:
- Display headings: font-sans (Geist Sans / Inter), tracking-tight, font-bold
- Body: font-sans, leading-relaxed
- Use clamp() for fluid scaling: text-[clamp(2rem,5vw,4rem)] cho display

Mobile-first: Design 375px FIRST, then md: (768) and lg: (1024) prefixes for breakpoints.

Vietnamese language MANDATORY for all visible text. NO English in UI labels. UTF-8 encoding.

Anti-template policy (per ECC web/design-quality.md):
- KHÔNG generic centered hero with gradient blob
- KHÔNG uniform card grids — use bento + hierarchy + scale contrast
- KHÔNG safe gray-on-white — opinionated brand palette only
- KHÔNG flat layout — add overlap, depth, shadow-2xl, subtle motion
- DO use editorial composition, intentional rhythm in spacing, designed hover/focus states

Animate ONLY: transform, opacity, clip-path, filter (compositor-friendly).
NEVER animate: width, height, top, left, margin, padding, font-size.

Accessibility: WCAG AA contrast (4.5:1 body). Touch targets ≥ 44×44 px. Focus-visible rings.

shadcn/ui primitives available (assume installed): Button, Card, Input, Dialog, Select, Avatar, Badge, Tabs, Skeleton, Sonner toast, Progress.

Lucide React icons available.
```

---

## Sub-prompt 1 — Landing Hero Section

**Paste into v0.dev:**

```
[paste DESIGN SYSTEM preamble above first]

Generate a landing page Hero section for ReLoop — Vietnamese recycling marketplace tagline "Shazam cho rác".

Layout direction: EDITORIAL — break the symmetric centered-hero default. Use asymmetric grid with overlap.

Composition (mobile 375px first):
- Top-left: small eyebrow text "TDTU Vibe Coding 2026" với badge `bg-eco-bg-soft text-brand-green text-xs uppercase tracking-widest`
- Main headline 2 lines: "Shazam cho rác." (line 1, very large clamp(2.5rem, 8vw, 5.5rem), font-bold, text-text)
- Sub-headline (line 2, smaller): "Chụp 1 ảnh, biết ngay đồ này tái chế được không, đi đâu, hoặc ai đang cần." (clamp(1rem, 2vw, 1.25rem), text-text-muted, max-w-2xl)
- Below: 2 CTAs side-by-side mobile, inline desktop:
  - Primary: "Quét rác miễn phí" → bg-gradient-to-r from-brand-green to-brand-blue, text-white, rounded-full px-8 py-4, shadow-xl shadow-brand-green/20, hover:scale-[1.02] transition-transform duration-300
  - Secondary: "Xem bản đồ thu gom" → border-2 border-text/10 bg-eco-bg, text-text, rounded-full px-8 py-4, hover:border-brand-green/30
- Visual side (md:absolute md:right-0 md:top-12, mobile below CTAs):
  - Phone mockup hoặc abstract gradient blob (rounded-3xl, aspect-[4/5], bg-gradient-to-br from-brand-green/20 via-brand-blue/10 to-transparent, with floating Lucide icons (Recycle, Sparkles, MapPin) absolutely positioned with subtle staggered motion via animate-pulse / will-change-transform
  - Add a subtle grain texture overlay (mix-blend-overlay opacity-[0.03])

Below hero, full-width 3-stat band (grid grid-cols-3 gap-4 md:gap-8, py-12 border-t border-text/5):
- Stat 1: number "10,000+" + label "đồ tái chế đã quét"
- Stat 2: number "50+" + label "điểm thu gom xác minh"
- Stat 3: number "12 trường" + label "THPT tham gia"
Each stat: number text-4xl md:text-6xl font-bold bg-gradient-to-br from-brand-green to-brand-blue bg-clip-text text-transparent, label text-sm text-text-muted

Inspiration: editorial magazine cover meets product launch. Look at Linear.app, Vercel.com, Apple newsroom for reference. NOT generic SaaS landing.

Output as a single React Server Component file, default export, Tailwind classes inline, no external CSS. File name: HeroSection.tsx.

Include semantic HTML: <section aria-labelledby="hero-heading"><h1 id="hero-heading">. Wrap CTAs in a <div role="group" aria-label="Hành động chính">.

Add prefers-reduced-motion guard: motion-safe:animate-pulse on icons.
```

---

## Sub-prompt 2 — Scan Result Card (AI Vision output)

**Paste into v0.dev:**

```
[paste DESIGN SYSTEM preamble first]

Generate a Scan Result Card for ReLoop — displayed sau khi user chụp ảnh đồ vật và GPT-4o Vision phân tích.

This is a CLIENT component with rich data viz. Use bento layout with hierarchy.

Props (TypeScript interface):
{
  detectedItem: string;          // "Chai nước nhựa PET 500ml"
  imageUrl: string;              // Supabase Storage URL
  materialCode: string;          // "PET" | "HDPE" | etc.
  materialNameVi: string;        // "Nhựa PET (số 1)"
  confidence: number;            // 0-1
  decompositionYearsMin: number; // 450
  decompositionYearsMax: number; // 1000
  ecoScore: number;              // 1-10
  recyclable: boolean;
  diyIdeas: string[];            // 3 items, Vietnamese
  warning: string | null;        // "Pin có chứa chất độc hại..." nếu nguy hiểm
}

Layout (mobile 375 first):
- Header row: image thumbnail (rounded-2xl 96×96, object-cover, ring-4 ring-brand-green/20) + col with detected_item h2 (text-2xl font-bold text-text) + material badge below
- Material badge: rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider, color from materialCode (PET=blue, GLASS=teal, METAL=slate, etc.) — generate a getMaterialColor() helper function

- Card 1 (Decomposition Gauge): full-width section bg-eco-bg-soft rounded-3xl p-6 mb-4
  - Label "Thời gian phân hủy" text-sm text-text-muted
  - Big number: "{years_min}-{years_max} năm" text-4xl font-bold text-brand-green
  - Visual: horizontal bar with marker positioned by years (scale 0-1000 năm = 0-100% width). Bar bg-text/5, marker dot bg-gradient-to-r from-brand-green to-brand-blue, size 16px, with shadow-lg
  - Below bar: 4 tick labels ("0 năm", "100", "500", "1000+ năm") text-xs text-text-muted

- Card 2 (Eco Score Ring): grid grid-cols-2 gap-4 mt-4
  - Left: Circular progress ring SVG, eco_score/10 percentage. Stroke-width 12, gradient stroke from-brand-green to-brand-blue. Center: big number "8/10" text-3xl font-bold + label "Eco Score" text-xs text-text-muted
  - Right: Confidence percentage shadcn Progress bar, label "Độ tin cậy AI" + value "92%"

- Card 3 (DIY Ideas grid): mt-4
  - Heading "3 cách tái chế tại nhà" text-lg font-semibold flex items-center gap-2 with Lucide Sparkles icon text-brand-green
  - Grid grid-cols-1 md:grid-cols-3 gap-3
  - Each idea: Card bg-white border border-text/5 rounded-2xl p-4 hover:border-brand-green/30 hover:shadow-lg transition-all duration-300
  - Inside: number 1/2/3 in circle (bg-brand-green/10 text-brand-green w-8 h-8 rounded-full grid place-items-center text-sm font-bold) + idea text text-sm text-text leading-relaxed

- Warning Banner (conditional, ONLY render if warning prop is non-null):
  - Full-width red banner: bg-red-50 border-l-4 border-red-500 rounded-r-2xl p-4 mt-4
  - Lucide AlertTriangle icon text-red-500 + warning text text-red-900 font-medium
  - Action button "Tìm điểm xử lý gần nhất" text-red-600 underline font-semibold

- Footer actions: flex gap-3 mt-6
  - "Đăng tin tặng/đổi" → bg-gradient-to-r from-brand-green to-brand-blue text-white rounded-full px-6 py-3
  - "Chia sẻ kết quả 📸" → variant ghost, opens ShareDialog (placeholder onClick)

Add subtle entrance animation: motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-500

Output as ScanResultCard.tsx, "use client", export default. Self-contained — include getMaterialColor helper inline.
```

---

## Sub-prompt 3 — Leaderboard Podium with School Filter

**Paste into v0.dev:**

```
[paste DESIGN SYSTEM preamble first]

Generate a Leaderboard component for ReLoop — top 3 podium + table 4-20 + school filter dropdown.

Props (TypeScript):
{
  topThree: Array<{ rank: 1|2|3; displayName: string; avatarUrl: string|null; ecoPoints: number; school: string; }>;
  rest: Array<{ rank: number; displayName: string; avatarUrl: string|null; ecoPoints: number; school: string; level: number; }>;
  schools: Array<{ code: string; nameVi: string; }>; // 12 THPT + "Trường khác"
  selectedSchoolCode: string | null;
  onSchoolChange: (code: string | null) => void;
}

Layout (mobile 375 first):

Header section:
- Heading h1 "Bảng xếp hạng Eco Warriors" text-3xl md:text-5xl font-bold text-text tracking-tight
- Subtitle "Học sinh THPT đóng góp nhiều nhất cho môi trường" text-text-muted

School filter row (sticky top-0 bg-eco-bg/80 backdrop-blur-md py-4 z-10):
- Lucide School icon text-brand-green
- shadcn Select component, trigger label "Chọn trường THPT", value "Tất cả trường" hoặc school name
- Reset button "Xóa lọc" only visible if selectedSchoolCode != null, variant ghost with X icon

Podium (grid grid-cols-3 gap-4 mt-8 items-end):
- Order: rank 2 left, rank 1 center (taller), rank 3 right
- Each podium block:
  - Avatar circle (size depending on rank: 1st=128px, 2nd/3rd=96px) ring-4 ring-{gold|silver|bronze}, where gold=#FFD700, silver=#C0C0C0, bronze=#CD7F32 (use ring-amber-400 ring-slate-300 ring-orange-700 as Tailwind approximations)
  - Rank crown emoji floating top-right (👑 for #1, 🥈 for #2, 🥉 for #3)
  - Display name truncated text-base font-semibold mt-3
  - School name text-xs text-text-muted truncate
  - Eco points: text-2xl font-bold bg-gradient-to-br from-brand-green to-brand-blue bg-clip-text text-transparent, with 🌱 prefix
  - Podium block height: rank 1 = 200px, rank 2 = 160px, rank 3 = 120px (md only — mobile podiums all equal 120)
  - Block bg: rank 1 = bg-gradient-to-b from-amber-100 to-amber-50, rank 2 = from-slate-100 to-slate-50, rank 3 = from-orange-100 to-orange-50
  - Rounded-t-3xl, with subtle shadow-2xl shadow-amber-500/10 (top 1)

Table 4-20 below (mt-12):
- Heading "Top 4-20" text-xl font-semibold mb-4
- Mobile: stacked cards grid grid-cols-1 gap-3
- Desktop: actual table with shadcn Table or styled <table>: cols (#, Avatar+Name, Trường, Cấp độ, Eco Points)
- Row hover: bg-eco-bg-soft transition-colors
- Rank cell: text-text-muted font-mono w-10
- Avatar+Name: flex gap-3 items-center, avatar w-10 h-10 rounded-full ring-2 ring-text/5
- Eco points: bg-eco-bg-soft px-3 py-1 rounded-full text-sm font-semibold text-brand-green tabular-nums
- Level cell: badge "Cấp {level}" small bg-text/5 text-text rounded-md

Empty state (if rest.length === 0):
- Centered Lucide Trophy icon w-16 h-16 text-text-muted/30
- Text "Chưa có ai trên bảng xếp hạng. Hãy là người đầu tiên! 🌱"

Loading state: shadcn Skeleton 7 rows pulsing.

Output as LeaderboardPodium.tsx, "use client", export default. Use Lucide Trophy, School, Crown icons.
```

---

## Sub-prompt 4 — Eco Score Share Card (1080×1080 Instagram square)

**Paste into v0.dev:**

```
[paste DESIGN SYSTEM preamble first]

Generate an EcoScoreCard component for Instagram/Facebook share. Fixed 1080×1080 px (will be exported to PNG via html-to-image).

CRITICAL: This is a STATIC card for image export. NOT interactive. NO hover states. NO animations. ALL absolute positioning OK because aspect ratio is fixed.

Props (TypeScript):
{
  detectedItem: string;          // "Chai nước nhựa PET 500ml"
  imageUrl: string;              // user scan image (Supabase Storage)
  materialCode: string;
  materialNameVi: string;
  decompositionYears: number;    // pick max
  ecoScore: number;              // 1-10
  badgeUnlockedName?: string;    // optional, eg "Plastic Hunter 10"
  username: string;              // display_name
  qrCodeDataUrl: string;         // pre-generated QR data:image
}

Layout (1080×1080 fixed, use w-[1080px] h-[1080px] inline style, all px units):

Outer container:
- bg-gradient-to-br from-brand-green to-brand-blue (full bleed)
- relative overflow-hidden
- Subtle noise texture overlay: absolute inset-0 mix-blend-overlay opacity-10 with SVG fractal noise pattern (inline)

Top-left zone (px 64 from top/left):
- ReLoop logo + wordmark white text-3xl font-bold tracking-tight (placeholder text "🌱 ReLoop" until logo asset)
- Below: small caption "Bảng xếp hạng môi trường" text-white/70 text-sm

Top-right zone:
- User scan image rounded-3xl 320×320 px ring-8 ring-white/20 shadow-2xl shadow-black/30 object-cover
- Position: absolute top-16 right-16

Center zone (vertical center, mt around 380):
- Headline: 2 lines, text-white font-bold tracking-tight
  - Line 1 (smaller): "Tôi vừa cứu Trái Đất khỏi"
  - Line 2 (huge): "{detectedItem}" — text-[64px] leading-[1.05]
  - Line 3: "sống lâu hơn ông cố tôi {years} đời 🤯" text-[36px] text-white/90 max-w-[800px]

Eco Score gauge zone (centered horizontal, ~px 600 from top):
- Big circular gauge: SVG 240×240, white track 16px, fill stroke from white to white/50 based on score/10
- Center label: "{score}" text-[120px] font-bold text-white + "/10" text-[40px] text-white/60 inline
- Below: "ECO SCORE" text-white/70 text-sm uppercase tracking-[0.3em] text-center

Material chip:
- Position: absolute bottom-[280px] left-1/2 -translate-x-1/2
- bg-white/15 backdrop-blur-md rounded-full px-6 py-3
- Lucide Recycle icon white + "{materialNameVi}" text-white font-semibold

Badge unlock chip (conditional, only render if badgeUnlockedName):
- Position: absolute bottom-[200px] left-1/2 -translate-x-1/2
- bg-amber-400 text-amber-950 rounded-full px-5 py-2 font-bold
- "🏆 Mở khóa: {badgeUnlockedName}"

Bottom zone (last 160px):
- Left side: username "@{username}" text-white text-2xl + "vừa scan trên ReLoop" text-white/70 text-base
- Right side (px 64 from right): QR code image 120×120 (use qrCodeDataUrl prop) bg-white p-3 rounded-2xl + below "reloop.app" text-white/90 font-mono text-sm watermark

Watermark: subtle "ReLoop · Vibe Coding 2026" text-white/30 text-xs absolute bottom-4 left-1/2 -translate-x-1/2

Add a div with id="eco-score-card" on outer container so html-to-image library can target it for PNG export.

Output as EcoScoreCard.tsx, "use client" not required (static), export default. Self-contained inline SVG for gauge and noise pattern.
```

---

## Sub-prompt 5 — Admin Moderation Table

**Paste into v0.dev:**

```
[paste DESIGN SYSTEM preamble first]

Generate an Admin Moderation Table for ReLoop — admins approve/reject pending listings, collection points, and flagged users. 3 tabs.

Props (TypeScript):
{
  pendingListings: Array<{ id: string; title: string; thumbnail: string; ownerName: string; ownerSchool: string; intent: 'give'|'exchange'|'sell_scrap'|'seek'; createdAt: string; aiModerationFlag: string|null; }>;
  unverifiedPoints: Array<{ id: string; name: string; type: string; address: string; lat: number; lng: number; contributorName: string; upvotes: number; downvotes: number; }>;
  flaggedUsers: Array<{ id: string; displayName: string; email: string; flagCount: number; lastFlagAt: string; }>;
  onApproveListings: (ids: string[], reason?: string) => Promise<void>;
  onRejectListings: (ids: string[], reason: string) => Promise<void>;
  onVerifyPoint: (id: string) => Promise<void>;
  onBanUser: (id: string, reason: string) => Promise<void>;
}

Layout (desktop-first since admin-only — but still md: responsive):

Header:
- h1 "Trung tâm kiểm duyệt" text-3xl font-bold text-text
- Subtitle "Phê duyệt nội dung từ cộng đồng" text-text-muted

Tabs (shadcn Tabs):
- 3 triggers with count badges:
  - "Tin đăng chờ duyệt" + badge bg-amber-100 text-amber-900 rounded-full px-2 text-xs ({pendingListings.length})
  - "Điểm thu gom chưa xác minh" + badge ({unverifiedPoints.length})
  - "Người dùng bị báo cáo" + badge bg-red-100 text-red-900 ({flaggedUsers.length})

Tab 1 — Listings Table:

BulkActionBar (sticky top, only visible when selected.length > 0):
- bg-brand-green/10 border-l-4 border-brand-green rounded-r-2xl p-4 flex items-center justify-between
- Left: "{selected.length} tin đã chọn" text-text font-semibold
- Right: button "Phê duyệt tất cả" (bg-brand-green text-white rounded-full px-5 py-2) + button "Từ chối tất cả" (border border-red-500 text-red-600 rounded-full px-5 py-2 ml-2 — opens shadcn Dialog for reason input)
- Show optional reason textarea inline above buttons when reject is hovered (collapse animation)

Table columns:
- Checkbox (header: select-all)
- Thumbnail w-16 h-16 rounded-xl object-cover
- Title (font-semibold) + intent badge inline (bg-eco-bg-soft text-brand-green text-xs uppercase)
- Owner cell: avatar + name + school (text-xs text-text-muted)
- AI flag cell: if aiModerationFlag, show red Lucide AlertCircle + flag reason; if null, show green Lucide CheckCircle
- CreatedAt: relative time "2 giờ trước" Vietnamese (use date-fns/locale/vi placeholder)
- Per-row actions: ghost icon buttons "Xem chi tiết" Lucide Eye, "Duyệt" Lucide Check, "Từ chối" Lucide X

Tab 2 — Collection Points Table:
- Similar structure
- Cols: Checkbox, Name, Type badge, Address, Contributor, Vote ratio (Upvotes "8" green / Downvotes "1" red, with vote ratio bar 88%), Action "Xác minh" button bg-brand-green text-white rounded-full px-4 py-2
- Click row → opens map preview Dialog showing lat/lng on small Leaflet (placeholder div with "Map preview" until backend integrated)

Tab 3 — Flagged Users Table:
- Cols: Checkbox, Avatar+Name, Email, Flag count (red badge if ≥3), Last flag time, Action "Cảnh báo" hoặc "Cấm tài khoản" (red destructive button opens confirm Dialog with required reason textarea, min 10 chars)

Empty state per tab:
- Centered Lucide CheckCircle2 w-16 h-16 text-brand-green/30
- Text "Tuyệt vời! Không có gì cần kiểm duyệt." text-text-muted

Loading state: shadcn Skeleton 5 rows pulsing.

Audit trail micro-detail: at bottom of page show "Đã kiểm duyệt {N} mục hôm nay" small text-text-muted with 🌱 emoji.

Accessibility:
- Table has <caption className="sr-only">Tin đăng chờ kiểm duyệt</caption>
- Bulk actions have aria-label
- Confirm dialogs have proper focus trap (shadcn Dialog handles this)

Output as ModerationTable.tsx, "use client", export default. Use Lucide icons (Check, X, Eye, AlertCircle, CheckCircle, AlertTriangle, CheckCircle2). Use shadcn Tabs, Table, Dialog, Checkbox, Button, Avatar, Badge.
```

---

## How to use this pack

1. Open v0.dev. Start a new chat per sub-prompt (don't combine — v0 works best one component family at a time).
2. Paste **DESIGN SYSTEM preamble** + ONE sub-prompt body.
3. v0 generates JSX. Iterate via follow-up messages: "make the gauge larger", "use bento grid instead of stacked", "tighten the gradient stops".
4. When happy, click "Add to project" or copy code. Save to `D:\reloop\components\` in the right folder per Section 8 of [LOVABLE-PROMPT.md](LOVABLE-PROMPT.md):
   - HeroSection.tsx → `components/shared/`
   - ScanResultCard.tsx → `components/scan/ResultCard.tsx`
   - LeaderboardPodium.tsx → `components/shared/`
   - EcoScoreCard.tsx → `components/scan/`
   - ModerationTable.tsx → `components/admin/`
5. Wire up real data props in your Server Component caller. v0 components are presentational — backend stays in Lovable/Bolt-built layer.

## Quality bar checklist (per [web/design-quality.md](file:///C:/Users/Sev7n%20Nguyen/.claude/rules/ecc/web/design-quality.md))

For each generated component, verify:
- [ ] Doesn't look like default Tailwind/shadcn template
- [ ] Has intentional hover/focus/active states (or N/A for static export-only EcoScoreCard)
- [ ] Uses hierarchy (scale contrast) not uniform emphasis
- [ ] Would look believable in a real product screenshot
- [ ] All Vietnamese labels present, no English leakage
- [ ] Mobile 375px renders without horizontal scroll
- [ ] Color contrast WCAG AA on body text
- [ ] Touch targets ≥ 44px

## Cross-reference

- Backend + business logic prompts → [LOVABLE-PROMPT.md](LOVABLE-PROMPT.md) (full-stack 4500 words) or [BOLT-PROMPT.md](BOLT-PROMPT.md) (Sprint 1 iterative 2500 words).
- Decision matrix → [AI-BUILDERS-MATRIX.md](AI-BUILDERS-MATRIX.md).

---

**END OF V0 PROMPT PACK — generate 1 component at a time, iterate, paste into project.**
