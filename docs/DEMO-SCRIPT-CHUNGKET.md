# ReLoop — Demo Script Chung kết (7 phút)

> Print as A5 cue card. Practice 7 lần trước khi lên sân khấu.
> Cấu trúc: 5 phút deck + 2 phút Q&A buffer. Tổng = 7 phút.

---

## Setup checklist (15 phút trước demo)

- [ ] Laptop pin > 90% + sạc cắm sẵn (không tin pin)
- [ ] Chrome ẩn danh (clean state, không cookie cũ)
- [ ] **5 tab mở sẵn theo thứ tự:**
  1. Pitch deck (Keynote/Slides full-screen)
  2. `https://reloop-mvp.vercel.app` (production prod)
  3. PostHog dashboard (Slide 8 screenshot live)
  4. GitHub Actions tab CI green (Slide 7 proof)
  5. Sentry dashboard (0 errors proof)
- [ ] Đăng nhập sẵn `demo1@reloop.app` ở tab production
- [ ] Phone (cùng wifi sân khấu) sẵn để scan QR slide cuối
- [ ] HDMI → projector test xong, 1920×1080
- [ ] Volume hệ thống 50%
- [ ] Slack / Discord / mail đã đóng
- [ ] **3 backup video preload:**
  - `backup-demo-3min.mp4` (full demo Plan B)
  - `backup-cached-scan.mp4` (Plan C OpenAI down)
  - `backup-30s-tldr.mp4` (Plan emergency)
- [ ] **Hotspot 4G** test ngay tại sân khấu (wifi BTC có thể chập)
- [ ] **Chai nhựa thật** (PET trong suốt) cầm tay để scan live

---

## Script (7:00 tổng — 5 phút deck + 2 phút Q&A buffer)

### 0:00 — 0:10 — Slide 1 Cover

> "Xin chào ban giám khảo. Em là Sev7n. Đây là ReLoop —
> sau 14 ngày, đây là những gì 1 lập trình viên + 12 AI agent đã làm được."

(Click sang Slide 2.)

### 0:10 — 0:50 — Slide 2 Problem (40s)

> "Mỗi giây Việt Nam thải 57kg nhựa ra biển. 1.8 triệu tấn mỗi năm.
> Chúng em phỏng vấn 23 bạn THPT. 21 nói: 'biết tái chế quan trọng,
> nhưng không biết bắt đầu chỗ nào.' Vấn đề không phải nhận thức —
> là **trải nghiệm**. UX rác đang ở năm 1995."

(Click sang Slide 3.)

### 0:50 — 1:20 — Slide 3 Why Now (30s)

> "Ba force kết hợp lần đầu: EPR Việt Nam luật mới 2024 yêu cầu data
> thu hồi rác — ReLoop là kênh đầu tiên có thể cung cấp. Gen Z 76%
> sẵn sàng trả thêm cho thương hiệu xanh. Và GPT-4o-mini năm nay
> rẻ gấp 10 năm ngoái — phân loại 1 ảnh = 0.0003 USD."

(Click sang Slide 4.)

### 1:20 — 2:00 — Slide 4 Solution (40s)

> "ReLoop có 3 trụ. **AI Scan**: chụp 1 ảnh, biết PET, 450 năm,
> Eco Score 9. **Marketplace**: cho/đổi/bán + Eco Coin + 5 badges.
> **Map**: 25 điểm thu gom seeded, user pin, cộng đồng vote.
> Một app. Toàn vòng đời rác. Bây giờ em chuyển sang demo trực tiếp."

(Click sang Slide 5 — bật timer 3:00 lớn.)

### 2:00 — 5:00 — Slide 5 Demo LIVE (3 phút)

| Thời điểm | Hành động | Lời dẫn |
| --------- | --------- | ------- |
| 2:00–2:15 | Mở tab production → `/scan` → camera | "Em mở ReLoop.vercel.app. Camera mở thẳng — không cần app store." |
| 2:15–2:45 | Chụp chai PET thật → đợi 3s → kết quả | "AI nhận diện ngay: PET, 450 năm, Eco Score 9/10. Ba hành động đề xuất." |
| 2:45–3:00 | Bấm "Share Eco Score" → modal 1080×1080 | "Share lên Facebook/IG ngay. Đây là viral hook Gen Z." |
| 3:00–3:30 | Mở `/listings` → tạo bài đăng | "Hoặc đăng marketplace. Form pre-fill từ scan. Cho/đổi/bán." |
| 3:30–4:00 | Mở `/map` → pin điểm mới + vote | "Map cộng đồng. Pin điểm mới, 5 vote = verified. Mô hình Wikipedia." |
| 4:00–4:30 | Mở `/leaderboard` → filter "TDTU" | "Leaderboard top 20. Lọc theo trường — TDTU đang #1 với 8 user active." |
| 4:30–5:00 | Switch tab admin `/admin` → 3 tabs | "Admin panel: Listings pending, Pin points pending, Banned users. Audit log đầy đủ. RLS default-deny." |

(Click sang Slide 6.)

### 5:00 — 5:40 — Slide 6 Tech (40s)

> "Stack: Next 16 RSC, Tailwind 4, Supabase Postgres + RLS, GPT-4o-mini.
> 4 migrations, 15 tables, 19 routes. Cache SHA256 tiết kiệm 80% AI cost.
> Server Components default — chỉ Client khi cần. ISR cho leaderboard."

(Click sang Slide 7.)

### 5:40 — 6:20 — Slide 7 AI Collaboration (40s)

> "1 lập trình viên + 12 AI agent. 70% AI / 30% human đo bằng commit log.
> Wave 9–11 chạy 3 agent đồng thời. Em không viết hết code —
> em là **conductor**, 12 agent là dàn nhạc. Mỗi commit có signature.
> DEVLOG public minh bạch."

(Click sang Slide 8.)

### 6:20 — 6:50 — Slide 8 Analytics (30s)

> "Production-grade từ ngày 1. PostHog 11 custom event live. Sentry 0 error.
> GitHub Actions 5 job đều green. Web Vitals: LCP 1.8s, CLS 0.04. Cron job
> daily cho leaderboard."

(Click sang Slide 9.)

### 6:50 — 7:00 — Slide 9–10 Closing (10s)

> "3 tháng: 5 trường THPT. 12 tháng: 10k user, 100 tấn rác. Revenue: B2B
> EPR data API. Cảm ơn ban giám khảo. Quét QR để vote — và thử ReLoop
> ngay bây giờ."

---

## Plan B — Mạng hỏng giữa demo

**Trigger:** Browser load > 5s không response, hoặc lỗi 500.

1. Nói rõ: "Để giữ thời gian, em chuyển sang video demo 3 phút đã prep."
2. Click vào tab video preload `backup-demo-3min.mp4`.
3. Video chạy với volume 50% — vẫn bám timeline.
4. Quay lại Slide 6 đúng phút 5:00.
5. **Không** cố reconnect wifi.

## Plan C — OpenAI API down

**Trigger:** Scan return error 503 hoặc timeout.

1. Nói: "AI API đang chậm — em demo cached version. Cache 80% là realistic production behavior."
2. Refresh trang scan với `?demo=cached` flag (load `cache_key: demo-pet-bottle-001`).
3. Kết quả Eco Score vẫn hiện đầy đủ (chỉ là cached, không fresh).
4. Tiếp tục demo bình thường.

## Plan D — Sân khấu cháy laptop / mất điện

**Trigger:** Laptop tắt máy, projector lỗi.

1. Mở phone → web https://reloop-mvp.vercel.app
2. AirPlay/Chromecast lên màn hình BTC nếu có
3. Demo trên phone trực tiếp (vẫn responsive thấy)
4. Nếu không có cast → đứng cạnh bàn BGK, demo phone trực tiếp cho 3 thầy cô

---

## Câu hỏi giám khảo (tham khảo `QA-PREP.md`)

7 câu hỏi đã chuẩn bị script trả lời ≤ 30s mỗi câu.
