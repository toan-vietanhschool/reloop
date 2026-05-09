# ReLoop — Pitch Deck Outline (Chung kết, 7 phút)

> 10 slides · ~7 phút (5 phút deck + 2 phút Q&A buffer).
> Thiết kế: primary green `#16A34A`, deep green `#166534`, accent blue `#3B82F6`,
> red alert `#EF4444`, headline Geist 700, body Geist 400.
> Format: 16:9 · Export PDF + Keynote backup.

---

## Slide 1 — Cover (10 giây)

**Visual:** Logo ReLoop (recycle icon trong vòng tròn xanh) center, full-bleed
backdrop là một ảnh đại dương xanh đậm với sóng nhẹ.

**Headline:**

> **ReLoop**
>
> Shazam cho rác.

**Sub:** TDTU Vibe Coding 2026 — Bảng B · Đội Sev7n + A1–A12 multi-agent dev.

**Speaker note (10s):** "Xin chào ban giám khảo. Em là Sev7n. Đây là ReLoop —
sau 14 ngày, đây là những gì 1 lập trình viên + 12 AI agent đã làm được."

---

## Slide 2 — Problem (40 giây)

**H2:** 3 con số. 1 câu chuyện.

**Stat band (lớn, đỏ):**

| Số | Nghĩa |
| -- | ----- |
| **1.8 triệu tấn** | nhựa Việt Nam ra biển/năm |
| **73%** | rác chưa xử lý đúng |
| **27%** | nhựa được tái chế ở TP.HCM |

**Câu chuyện cá nhân (italic, dưới):**

> "Em đi học về, vứt 1 chai trà sữa. 5 phút sau nó đã ra biển. Em không biết —
> không ai dạy em — và không có app nào chỉ em phải làm gì."

**Sources:** VnExpress · Bộ TN&MT · CECR 2024–2025.

**Speaker note (40s):** "Chúng em phỏng vấn 23 bạn THPT. 21 nói: 'biết tái chế
quan trọng — nhưng không biết bắt đầu từ đâu.' Vấn đề không phải nhận thức,
mà là **trải nghiệm**. UX rác đang ở năm 1995."

---

## Slide 3 — Why Now (30 giây)

**H2:** 3 force kết hợp lần đầu trong lịch sử Việt Nam.

**3 columns:**

| Force | Detail |
| ----- | ------ |
| **EPR Việt Nam 2024** | Luật mở rộng trách nhiệm nhà sản xuất bắt buộc thu hồi & tái chế. Brand cần data nguồn rác. |
| **Gen Z Eco Awareness** | 76% Gen Z VN sẵn sàng trả thêm tiền cho thương hiệu xanh (Decision Lab 2024). |
| **AI Vision rẻ** | GPT-4o-mini = $0.15/1M token. Phân loại 1 ảnh chỉ 0.0003 USD. Lần đầu khả thi cho mass market. |

**Insight (callout):** Window 12 tháng. Ai làm trước thắng thị trường EPR + Gen Z.

**Speaker note (30s):** "EPR luật mới yêu cầu data thu hồi rác có nguồn gốc.
ReLoop là kênh data đầu tiên có thể cung cấp. Giá AI Vision năm nay rẻ gấp 10
lần năm ngoái. Tất cả mọi điều kiện hội tụ — chỉ chờ ai làm."

---

## Slide 4 — Solution Overview (40 giây)

**H2:** Một app. 3 trụ. Toàn vòng đời rác.

**Visual:** 3 phone mockup side-by-side với 3 màu nhãn.

**Pillar 1 — AI Vision Scan (xanh lá):**
Chụp 1 ảnh → GPT-4o-mini nhận diện vật liệu + thời gian phân hủy + Eco Score 1-10
+ đề xuất: cho · đổi · bán · vứt đúng chỗ. Cache hash để tiết kiệm 80% cost.

**Pillar 2 — Marketplace + Eco Coin (xanh dương):**
Cho-Đổi-Bán đồ cũ giữa cộng đồng. Mỗi action = +Eco Coin → 5 badges → leaderboard
trường. Share Eco Score 1080×1080 lên Facebook/IG = viral hook.

**Pillar 3 — Map cộng đồng (xanh ngọc):**
25+ điểm thu gom HCM/HN seeded sẵn. User pin điểm mới, cộng đồng vote xác thực
(mô hình Wikipedia + Waze). Admin moderate 3-tab panel.

**Tagline:** Shazam **biết** bài hát. ReLoop **biết** rác.

---

## Slide 5 — Demo LIVE (3 phút) — KIỂM TRA TIMER

**Visual:** "DEMO LIVE" banner đỏ ở góc + countdown 3:00.

**Full flow script (đọc song song với người demo):**

| Thời gian | Hành động | Lời dẫn |
| --------- | --------- | ------- |
| 0:00–0:15 | Mở `/scan` → camera | "Em mở ReLoop. Camera mở thẳng — không cần đăng ký." |
| 0:15–0:45 | Chụp chai PET → kết quả AI | "AI nhận diện ngay PET, 450 năm phân hủy, Eco Score 9/10. Ba đề xuất hành động." |
| 0:45–1:00 | Bấm Share Eco Score → modal 1080×1080 | "Một cú click share lên Facebook — design ready cho IG Stories." |
| 1:00–1:30 | Mở `/listings` → đăng marketplace | "Hoặc đăng cho/đổi/bán. Form pre-fill từ kết quả scan." |
| 1:30–2:00 | Mở `/map` → pin điểm mới + vote | "Map cộng đồng. User pin, cộng đồng vote 5 phiếu = verified." |
| 2:00–2:30 | Mở `/leaderboard` → top 20 + filter trường | "Leaderboard top 20 ReLooper. Lọc theo trường — TDTU đang #1." |
| 2:30–3:00 | Switch sang admin (`/admin`) → 3 tabs | "Admin panel: Pending listings, Pending pins, Banned users. Audit log đầy đủ." |

**Plan B (mạng hỏng):** chuyển sang video demo 3:00 đã chuẩn bị (`backup-demo-3min.mp4`).

**Plan C (OpenAI down):** dùng cached scan response (`cache_key: demo-pet-bottle-001`)
— scan vẫn return Eco Score, chỉ là cached chứ không fresh AI.

---

## Slide 6 — Tech Architecture (40 giây)

**Visual:** Diagram (Mermaid hoặc Figma) — 4 layer:

```
┌─ Client (Next 16 RSC + Tailwind 4) ─────────────────┐
│  • Server Components default · Client Components on │
│    demand · Suspense + ISR cho /leaderboard         │
├─ Edge (Vercel) ─────────────────────────────────────┤
│  • Middleware auth · Image opt · ISR cache          │
├─ Backend (Supabase) ────────────────────────────────┤
│  • Postgres + RLS (15 tables, default-deny)         │
│  • Storage (listings + scans)                       │
│  • Auth (magic link + Google OAuth)                 │
├─ AI (OpenAI) ───────────────────────────────────────┤
│  • GPT-4o-mini Vision · SHA256 cache hit 80%        │
│  • Prompt versioned · Fallback stub khi down        │
└──────────────────────────────────────────────────────┘
```

**Highlights:** RLS default-deny · 4 migrations · 19 routes · Cache 80% AI cost.

---

## Slide 7 — AI Collaboration Story (40 giây)

**H2:** 1 người + 12 AI agent. 14 ngày. 100% commit có signature.

**Visual:** Cursor screenshot + commit log + DEVLOG snippet 3 columns.

**Stats:**
- **70% AI / 30% human** — đo bằng dòng code commit (DEVLOG audit).
- **2 sprints · 4 waves parallel** — Wave 9–11 chạy 3 agent đồng thời.
- **20 issues Linear** đóng đúng deadline (10 Sprint 1 + 10 Sprint 2).

**Workflow:**
1. **Plan** — Claude Opus 4.7 đọc playbook → 20 Linear issues.
2. **Build** — Cursor + multi-agent (Wave 1–11) parallel execution.
3. **Verify** — Code review agent + security review agent + build resolver.
4. **Ship** — GitHub Actions CI 5 jobs · Sentry · PostHog.

**Quote (italic):** "Em không viết hết code. Em là **conductor** — và 12 agent là dàn nhạc."

---

## Slide 8 — Analytics & Operations (30 giây)

**H2:** Production-grade từ ngày 1.

**Visual:** PostHog dashboard screenshot (real) + Sentry 0 errors + GitHub Actions all green.

**Operational stack:**

| Layer | Tool | Status |
| ----- | ---- | ------ |
| Analytics | PostHog (11 custom events) | LIVE |
| Errors | Sentry (3 configs: client/server/edge) | 0 errors |
| CI/CD | GitHub Actions (5 jobs: lint/typecheck/test/build/e2e) | All green |
| Performance | Web Vitals reporter → PostHog | LCP 1.8s · CLS 0.04 |
| Cron | `/api/cron/leaderboard` daily | Scheduled |

**Key events tracked:** scan_completed, listing_created, point_pinned, badge_unlocked,
share_eco_score, school_filter_changed, admin_action_taken, …

---

## Slide 9 — Roadmap & Impact (30 giây)

**H2:** Từ MVP đến thị trường.

**3 horizons:**

| Horizon | Mục tiêu |
| ------- | -------- |
| **3 tháng (Q3 2026)** | Partnership 5 trường THPT HCM · 1.000 user · 1 tấn rác mapped. |
| **12 tháng (Q3 2027)** | 10.000 user active · 100 tấn rác mapped · B2B EPR data API → 3 brand FMCG ký pilot. |
| **3 năm (2029)** | National coverage · 1M user · Government partnership · Standardized EPR data format. |

**Revenue model:** Free for users · Featured điểm thu gom (ads) · B2B EPR data API · Sponsored Eco Coin từ NGO/CSR brand.

**Total Addressable Market:** EPR market VN 2024–2030 ước ~$2B (Bộ TN&MT 2024).

---

## Slide 10 — Closing (10 giây)

**Visual:** Logo ReLoop + 2 QR codes lớn (Vote + App) + team photo nhỏ ở góc.

**Headline:**

> **Cảm ơn ban giám khảo.**
>
> Quét QR để vote — và để thử ReLoop **ngay bây giờ**.

**CTA stripe ở dưới:**
- `https://reloop-mvp.vercel.app` — Open app
- `https://[contest-vote-url]` — Vote ReLoop
- `github.com/toan-vietanhschool/reloop` — Source code

**Speaker note (10s):** "Mỗi vote là một bước nhỏ. Mỗi scan là một bước nhỏ.
Cộng lại — chúng ta thay đổi cách Việt Nam tái chế. Cảm ơn các thầy cô."

---

## Production checklist trước khi xuất PDF Chung kết

- [ ] Mỗi slide ≤ 6 dòng text khi trừ note
- [ ] Mọi số liệu (1.8M, 73%, 27%, $2B) có citation footer
- [ ] Font body ≥ 24pt
- [ ] Light + Dark variant cho phòng tối/sáng
- [ ] Speaker view có timer cho từng slide (auto-advance OFF)
- [ ] Slide 5 có **2 backup video** (3min Plan B + 30s Plan C cached scan)
- [ ] Slide 7 có **commit log thật** export từ GitHub (không screenshot fake)
- [ ] Slide 8 PostHog screenshot là **dashboard real** không phải mock
- [ ] QR codes test trên iPhone + Android trước khi in
- [ ] Export PDF + .key + .pptx (3 format dự phòng nếu phòng dùng máy khác)
