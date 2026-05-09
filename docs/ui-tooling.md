# UI Tooling — ReLoop (Vibe Coding 2026)

> Tài liệu này định nghĩa quy trình sinh UI bằng AI cho dự án ReLoop sau khi nỗ lực tích hợp Stitch (Google) qua MCP **không khả thi** tại thời điểm 2026-05-09.
>
> Liên kết kế hoạch gốc: `C:\Users\Sev7n Nguyen\.claude\plans\c-users-sev7n-nguyen-downloads-compass-glistening-liskov.md` (PHẦN B.2)

---

## 1. Tại sao không dùng Stitch MCP

Stitch là sản phẩm AI design của Google (`stitch.withgoogle.com`). Trinh sát W1-B (2026-05-09) xác nhận:

- Trang `/settings` được auth-gate bằng Google Identity Services (GIS) iframe; không có nút **"Generate token"**, **"API key"** hoặc **"Connect MCP"** nào lộ ra ở UI công khai.
- Phần shell là Angular SPA — DOM ở trạng thái blank cho user chưa đăng nhập, kể cả sau khi extension Claude-in-Chrome inspect kỹ.
- `developers.google.com/stitch` **không tồn tại** (trả 404). Không có public API doc, không có OAuth scope dành cho Stitch, không có CLI client.
- Repo công khai `googleapis/google-cloud-*` không chứa client cho `stitch`.

**Kết luận:** Stitch hiện chưa expose Model Context Protocol server hoặc REST API public. Việc đăng ký tool MCP cho Stitch không khả thi cho đến khi Google ra mắt developer surface.

**Quyết định kiến trúc:**

| Vai trò | Công cụ | Tích hợp |
|---------|---------|----------|
| Primary AI UI generator | **v0.dev** (Vercel) | Web UI + Generate API có document |
| Secondary AI UI exploratory | **Stitch web UI** | Manual (đăng nhập Google, copy/paste output) |
| Production component library | **shadcn/ui** | Đã cài sẵn qua T1-01 |

---

## 2. Primary tool — v0.dev workflow

### 2.1 Setup

1. Đăng nhập `https://v0.dev` bằng tài khoản Vercel của team.
2. Đảm bảo dự án ReLoop đã được link với Vercel team (xem `D:\reloop\.vercel\project.json`).
3. Cài Vercel CLI nếu cần đẩy nhanh: `pnpm dlx vercel@latest --version`.

### 2.2 Prompt template cho ReLoop

Mỗi prompt v0.dev nên theo cấu trúc:

```
Stack: Next.js 15 App Router, React 19, Tailwind CSS v4, shadcn/ui, Framer Motion.
Brand: ReLoop — recycling marketplace, eco-friendly tone, palette teal (#0EA5A4) + lime (#84CC16) trên surface neutral.
Component: <tên component>
Behavior: <hành vi tương tác>
Accessibility: WCAG 2.1 AA, keyboard nav, prefers-reduced-motion.
Output: TypeScript + Tailwind classes, no inline styles.
```

#### Ví dụ 1 — Hero section

```
Stack: Next.js 15 App Router, Tailwind v4, shadcn/ui, Framer Motion.
Brand: ReLoop — eco recycling marketplace, teal #0EA5A4 + lime #84CC16.
Component: HeroSection cho landing page.
Layout: editorial split — bên trái headline 2 dòng "Đổi rác thành điểm. Đổi điểm thành quà.", subhead, 2 CTA (primary "Quét rác ngay", ghost "Xem leaderboard"); bên phải mockup phone hiển thị scan camera đang nhận diện chai nhựa.
Animation: fade-up stagger 80ms cho text, scale 0.95→1 cho mockup khi vào viewport.
A11y: heading hierarchy đúng, focus-visible ring, respects reduced motion.
```

#### Ví dụ 2 — Scan modal

```
Stack: Next.js 15, Tailwind v4, shadcn/ui Dialog, Framer Motion.
Brand: ReLoop teal/lime.
Component: ScanModal — bottom-sheet trên mobile, centered dialog trên desktop.
Content: camera viewport (placeholder div aspect-[3/4]), bounding-box overlay khi detect, progress bar AI confidence 0–100%, kết quả label "Chai PET — 5 điểm" với icon recycle, 2 button "Lưu" / "Quét tiếp".
States: idle, detecting, success, error (camera denied).
A11y: dialog role, esc to close, focus trap.
```

#### Ví dụ 3 — Leaderboard podium

```
Stack: Next.js 15, Tailwind v4, shadcn/ui, Framer Motion.
Brand: ReLoop teal/lime + gold accent #F59E0B cho rank 1.
Component: LeaderboardPodium — hiển thị top 3 user theo điểm tuần.
Layout: 3 cột podium height bậc khác nhau (rank 2 trái, rank 1 giữa cao nhất, rank 3 phải), avatar tròn phía trên, tên + điểm phía dưới, badge số rank.
Animation: spring ease-out khi mount, rank 1 có sparkle particle nhẹ.
A11y: aria-label rõ "Hạng nhất: <tên>, <điểm> điểm", reduced motion ẩn particle.
```

### 2.3 Export flow

```
1. Generate trên v0.dev → preview component.
2. Iterate bằng follow-up prompt cho đến khi đạt yêu cầu.
3. Click "Add to project" hoặc "Copy code" → lấy JSX + Tailwind.
4. Tạo file mới tại: D:\reloop\components\<area>\<Component>.tsx
   - <area> ví dụ: hero, scan, leaderboard, marketing, dashboard.
5. Thêm header convention (xem 2.4) và import shadcn/ui từ @/components/ui.
6. Chạy code-reviewer agent trước khi commit.
```

### 2.4 Convention bắt buộc

Mọi component sinh từ v0.dev phải có header comment:

```tsx
// Initial scaffold from v0.dev — adapted for ReLoop
// Generated: 2026-MM-DD
// Reviewer: code-reviewer agent (status: passed)
```

**Yêu cầu trước khi merge:**

- [ ] Đổi thẻ `<img>` thuần sang `next/image` với width/height tường minh.
- [ ] Thay class màu hardcode bằng design token Tailwind v4 trong `D:\reloop\app\globals.css`.
- [ ] Bỏ console.log, TODO chưa giải quyết.
- [ ] Pass `pnpm lint` + `pnpm tsc --noEmit`.
- [ ] Code-reviewer agent đánh giá không có CRITICAL/HIGH issue.

### 2.5 Tham chiếu playbook

v0.dev là một phần của stack Vibe Coding 2026 — xem playbook **Phần 8.1** (`stack` mục) để biết bối cảnh đầy đủ. v0.dev được khuyến nghị cho speed-of-iteration trong giai đoạn MVP 48h.

---

## 3. Secondary tool — Stitch web UI manual workflow

### 3.1 Khi nào dùng

Stitch (qua web UI thủ công) phù hợp cho:

- **Marketing surfaces** cao cấp: landing hero, poster web companion, microsite phụ.
- **Animation-heavy hero** có art direction rõ ràng (editorial / dark luxury / scrollytelling).
- **Mood exploration** giai đoạn đầu khi chưa chốt visual direction.

**Không dùng Stitch cho:** form CRUD, dashboard, table — v0.dev nhanh hơn.

### 3.2 Quy trình

```
1. User đăng nhập tại https://stitch.withgoogle.com bằng Google account của team.
2. Tạo project mới → chọn surface (web / mobile).
3. Nhập prompt brief chi tiết (xem 3.3).
4. Iterate trong Stitch UI cho đến khi mood đạt.
5. Export:
   a) "Export to Figma" → mở Figma, copy frame.
   b) HOẶC copy HTML/CSS được Stitch sinh ra.
6. Manual port sang React + Tailwind tại D:\reloop\components\<area>\.
7. Chạy code-reviewer agent.
```

### 3.3 Brief example — ReLoop landing hero

```
Project: ReLoop, eco recycling marketplace cho sinh viên Việt Nam.
Surface: Web landing page, viewport ≥ 1440px, mobile responsive 375px.
Mood: editorial magazine + nature photography, clean luxury, không cartoon.
Palette: teal deep #0E7E7C, lime accent #84CC16, off-white #FAFAF7, charcoal #1A1A1A.
Typography: serif display cho headline (gợi ý: Fraunces, Recoleta), sans-serif cho body (Inter).
Hero content:
  - Eyebrow: "Vibe Coding 2026 · TDTU"
  - Headline 2 dòng: "Mỗi vỏ chai. Một vòng quay mới."
  - Subhead 1 câu: "Quét rác bằng AI, tích điểm xanh, đổi quà từ đối tác bền vững."
  - CTA primary: "Quét rác ngay" (lime fill)
  - CTA ghost: "Cho thương hiệu" (outline charcoal)
Visual: ảnh chai nhựa trong rừng cận cảnh, lá xanh blur background, particle texture nhẹ.
Animation: parallax layer chậm khi scroll, headline reveal split-text.
Tone: hopeful, modern, trust.
```

### 3.4 Caveat khi port sang React

- Output Stitch là HTML/CSS thuần hoặc Figma frame — **không phải React-ready**.
- Phải convert manual:
  - `<div class="...">` → JSX với `className`.
  - Inline `style="..."` → Tailwind utility hoặc CSS custom property trong `app/globals.css`.
  - Animation CSS keyframes → giữ nguyên CSS, hoặc port sang Framer Motion nếu cần kiểm soát viewport trigger.
  - Image asset → tải xuống, lưu `D:\reloop\public\images\<area>\` và dùng `next/image`.
- Đừng paste raw HTML qua `dangerouslySetInnerHTML` — vi phạm CSP và XSS guidance trong global rules.

---

## 4. Quyết định: dùng tool nào?

| Loại UI | Tool khuyến nghị | Lý do |
|---------|------------------|-------|
| Form CRUD (đăng ký, đăng nhập, profile edit) | **v0.dev** | Nhanh, đã hiểu shadcn/ui, output React thuần |
| Table, list, pagination | **v0.dev** | Tận dụng shadcn/ui DataTable |
| Dialog, modal, drawer | **v0.dev** | shadcn/ui primitives sẵn có |
| Dashboard widget, chart card | **v0.dev** | Iterate nhanh, chỉnh data binding dễ |
| Landing hero, marketing page | **Stitch** | Mood control tốt, editorial layout |
| Animation-heavy section, scrollytelling | **Stitch** + manual GSAP/Framer Motion | Stitch ra mood, dev port animation |
| Production design system component | **shadcn/ui** (đã cài qua T1-01) | Battle-tested, type-safe, accessibility built-in |
| Email template / poster web companion | **Stitch** | Output HTML thuần phù hợp |

**Nguyên tắc:** ưu tiên shadcn/ui đã cài sẵn. Chỉ dùng AI tool khi cần scaffold nhanh. Mọi output AI phải đi qua code-reviewer trước khi merge.

---

## 5. Re-evaluation tương lai

Stitch có thể release MCP / public API trong các đợt update sau. Lịch theo dõi:

- **Quarterly check** (tháng 3, 6, 9, 12): tìm `stitch mcp`, `stitch api`, `developers.google.com/stitch` trên GitHub + Google.
- **Tín hiệu trigger re-recon W1-B:**
  - Google công bố Stitch tại event (I/O, Cloud Next).
  - Repo `googleapis/*` xuất hiện client cho `stitch`.
  - `developers.google.com/stitch` chuyển từ 404 sang có nội dung.
  - Cộng đồng MCP đăng ký Stitch server tại `modelcontextprotocol/servers`.
- **Khi có MCP:**
  1. Re-run W1-B reconnaissance flow.
  2. Cập nhật file này, chuyển Stitch lên primary tier nếu chất lượng vượt v0.dev.
  3. Update playbook Phần 8.1 stack table.
  4. Snapshot cũ lưu lại tại `D:\reloop\docs\stitch-recon-<date>.md` để truy vết.

**Liên kết:**

- Plan gốc: `C:\Users\Sev7n Nguyen\.claude\plans\c-users-sev7n-nguyen-downloads-compass-glistening-liskov.md` — PHẦN B.2.
- Recon snapshot 2026-05-09: `D:\reloop\docs\stitch-recon-2026-05-09.md`.

---

_Tài liệu maintain bởi team ReLoop. Cập nhật khi có thay đổi tool hoặc khi Stitch ra MCP._
