# ReLoop — Pitch Deck Outline (Bán kết, 3 phút)

> Use this outline as a canvas in Google Slides / Keynote. Keep design system:
> primary green `#16A34A`, deep green `#166534`, accent blue `#3B82F6`,
> headline font Geist 700, body font Geist 400.

---

## Slide 1 — Hook (15 giây)

**Visual:** full-bleed photo of plastic bottles washed up on a Vietnamese beach,
dimmed to ~40% opacity. Headline center-aligned, white on dark gradient.

**Tagline (huge):**

> 1.8 triệu tấn nhựa Việt Nam ra biển mỗi năm.
>
> Bạn vừa vứt một mảnh trong số đó.

**Sub:** ReLoop — Shazam cho rác.

**Sources stripe at bottom (10pt):** VnExpress · Bộ TN&MT 2024–2025

**Speaker note (15s):** "Mỗi giây Việt Nam thải 57kg nhựa ra biển. Mở mắt buổi sáng,
bạn đã đứng trong một bãi rác — chỉ là chưa có ai chỉ cho bạn thấy."

---

## Slide 2 — Problem & Insight (30 giây)

**Layout:** 3 columns of pain.

**H2:** Tại sao tái chế ở Việt Nam đang thua?

**Column 1 — "Không biết":**
- 73% rác Việt Nam chưa qua xử lý đúng cách.
- Đa số người dân không nhận diện được vật liệu (PET vs HDPE vs PVC).

**Column 2 — "Không có chỗ":**
- Không tìm thấy điểm thu gom gần nhà.
- Vựa phế liệu nằm rải rác, không có map chính thức.

**Column 3 — "Không có động lực":**
- Tái chế không được thưởng — không gamification.
- Đồ cũ vứt còn dễ hơn cho/đổi/bán.

**Insight (red callout):** Người trẻ Việt Nam **muốn** xanh — nhưng UX rác đang ở năm 1995.

**Speaker note (30s):** "Chúng em phỏng vấn 23 bạn THPT. 21 bạn nói: 'biết tái chế quan trọng,
nhưng không biết bắt đầu chỗ nào'. Vấn đề không phải nhận thức — là **trải nghiệm**."

---

## Slide 3 — Solution (30 giây)

**H2:** Một app. Toàn bộ vòng đời rác.

**Visual:** 3 phone mockups side-by-side showing Scan → Map → Marketplace.

**Pillar 1 — AI Vision Scan (icon: ScanLine):**
- Chụp 1 ảnh → AI nhận diện vật liệu, ước lượng thời gian phân hủy.
- Chấm Eco Score 1-10 + đề xuất: cho · đổi · bán · vứt đúng chỗ.

**Pillar 2 — Map cộng đồng (icon: MapPin):**
- 20+ điểm thu gom HCM/HN seeded sẵn.
- User pin điểm mới, cộng đồng vote xác thực (mô hình Wikipedia).

**Pillar 3 — Marketplace + Eco Coin (icon: Recycle):**
- Cho — Đổi — Bán đồ cũ giữa cộng đồng.
- Mỗi hành động = +Eco Coin → badges → leaderboard trường.

**Tagline:** Shazam **biết** bài hát. ReLoop **biết** rác.

---

## Slide 4 — Demo LIVE (90 giây) — KIỂM TRA TIMER

**Visual:** "DEMO LIVE" banner ở góc, kèm timer countdown.

**Script (đọc song song với người demo):**

| Thời gian | Hành động | Lời dẫn |
| --------- | --------- | ------- |
| 0:00–0:10 | Mở app, bấm "Bắt đầu Scan" | "Em mở ReLoop. Camera mở thẳng — không cần đăng ký." |
| 0:10–0:30 | Chụp 1 chai PET → kết quả AI | "AI nhận diện ngay PET, mất 450 năm phân hủy. Eco Score 9/10." |
| 0:30–0:50 | Bấm "Đăng marketplace" → form ngắn | "Chuyển thẳng sang Marketplace. Chụp xong là đăng được." |
| 0:50–1:10 | Mở Map → tìm điểm thu gom gần | "Hoặc xem điểm thu gần nhất. 5 điểm trong bán kính 2km." |
| 1:10–1:30 | Profile → leaderboard trường | "Mỗi hành động cộng Eco Coin. Em đang đứng #3 trường." |

**Plan B nếu mạng hỏng:** chuyển sang video demo 60s đã chuẩn bị.

---

## Slide 5 — Tech & Team (15 giây)

**Layout:** team photo bên trái, stack bên phải.

**H2:** Built in 14 ngày. 3 người. Mã mở.

**Stack:**
- Next.js 15 App Router · React 19 · TypeScript
- Supabase (Postgres + RLS + Storage) · OpenAI Vision (gpt-4o-mini)
- Leaflet + OpenStreetMap · Vercel deploy

**Team:** Sev7n (Lead/Eng) · A1–A8 multi-agent dev

**CTA giant ở cuối:**

> Truy cập **reloop-mvp.vercel.app**
>
> Quét QR → vote cho ReLoop tại cuộc thi.

**[QR vote] [QR app]** — 2 mã song song.

**Speaker note (15s):** "Cảm ơn ban giám khảo. Quét QR để vote — và để thử app
ngay tại đây. Mọi đóng góp đều ghi nhận trong leaderboard công khai."

---

## Production checklist trước khi xuất PDF

- [ ] Mỗi slide không quá 6 dòng text khi không tính lời dẫn.
- [ ] Tất cả nguồn (1.8M tấn, 73%, 27%) có citation footer.
- [ ] Font size body >= 24pt (đọc được từ hàng cuối hội trường).
- [ ] Có dark + light variant nếu phòng tối / sáng khác nhau.
- [ ] Speaker view có note timer cho từng slide.
- [ ] Slide 4 có backup video 60s embed sẵn.
