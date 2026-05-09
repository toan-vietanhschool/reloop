# ReLoop — Demo Script (3 phút Bán kết)

> Print this as A5 cue card. Practice 5 lần trước khi lên sân khấu.

## Setup checklist (10 phút trước demo)

- [ ] Laptop pin > 80%.
- [ ] Chrome ở chế độ ẩn danh (clean state).
- [ ] Đã đăng nhập sẵn `demo1@reloop.app` ở 1 tab.
- [ ] Đã mở 5 tab theo thứ tự: `/dashboard` → `/scan` → `/listings` → `/map` → `/profile`.
- [ ] Phone (cùng wifi sân khấu) sẵn sàng để scan QR slide cuối.
- [ ] HDMI → projector test xong, độ phân giải 1920x1080.
- [ ] Volume hệ thống = 50% (không phát ngẫu nhiên).
- [ ] Tab Slack / Discord / mail đã đóng — KHÔNG để notification pop-up giữa demo.
- [ ] Backup video 60s đã lưu local + đã preload sẵn.

---

## Script (3:00 tổng)

### 0:00 — 0:15 — Hook + giới thiệu (Slide 1)

> "Xin chào ban giám khảo. Em là [tên]. Mỗi giây Việt Nam thải 57kg nhựa ra biển.
> Em đem cho mọi người một công cụ đơn giản: **Shazam — cho rác**."

(Click sang Slide 2.)

### 0:15 — 0:45 — Vấn đề (Slide 2)

> "Chúng em phỏng vấn 23 bạn THPT. 21 bạn nói: 'biết tái chế quan trọng,
> nhưng không biết bắt đầu chỗ nào'.
> Người trẻ Việt Nam **muốn** xanh — nhưng UX rác đang ở năm 1995."

(Click sang Slide 3.)

### 0:45 — 1:15 — Giải pháp (Slide 3)

> "ReLoop có 3 trụ cột: **Scan** AI Vision, **Map** điểm thu gom cộng đồng,
> và **Marketplace** đổi đồ cũ kèm Eco Coin. Tất cả trong một app, không cần đăng ký.
> Bây giờ em chuyển sang demo trực tiếp."

(Click sang Slide 4 — bật timer 90s.)

### 1:15 — 2:45 — Demo LIVE (Slide 4 + browser)

| Thời điểm | Hành động (chuyển tab nếu cần) | Lời dẫn (đọc rõ ràng) |
| --------- | ------------------------------ | --------------------- |
| 1:15–1:25 | Mở `/scan`, bấm "Bắt đầu Scan" | "Em mở ReLoop. Camera mở thẳng — không cần app store, không cần đăng ký." |
| 1:25–1:50 | Chụp 1 chai PET (chuẩn bị sẵn) → đợi 3s → kết quả AI hiện | "AI nhận diện ngay: PET, mất 450 năm phân hủy, Eco Score 9/10. Có 3 hành động được đề xuất." |
| 1:50–2:05 | Bấm "Đăng marketplace" → form pre-fill → submit | "Một cú click chuyển sang Marketplace. Bài đăng đã ready để cho/đổi/bán." |
| 2:05–2:25 | Mở `/map` → demo zoom + filter "PET" | "Hoặc mở bản đồ. 25 điểm thu gom HCM/HN — bao gồm 5 điểm do user pin." |
| 2:25–2:45 | Mở `/profile` → leaderboard | "Mỗi hành động cộng Eco Coin. Em là demo1, đứng #1 trong 10 ReLooper hôm nay." |

(Click sang Slide 5.)

### 2:45 — 3:00 — Tech, team, CTA (Slide 5)

> "Built trong 14 ngày bằng Next.js + Supabase + OpenAI Vision. Mã mở,
> link trên slide. Quét QR để vote — và thử app ngay tại đây. Cảm ơn ban giám khảo!"

---

## Plan B — Mạng hỏng

Nếu mất wifi giữa demo, **không cố gắng reconnect**. Thay vào đó:

1. Nói rõ: "Để tránh trễ thời gian, em chuyển sang video demo offline 60s đã chuẩn bị."
2. Click vào video tab mở sẵn (`backup-demo-60s.mp4`).
3. Video chạy → vẫn bám timer slide 4.
4. Quay lại slide 5 đúng phút 2:45.

## Câu hỏi giám khảo có thể hỏi

| Câu | Câu trả lời mẫu (≤ 30s) |
| --- | ---------------------- |
| "Mô hình kinh doanh là gì?" | "Phase 1 free — focus growth. Phase 2: thu phí điểm thu gom muốn vào featured + sponsored Eco Coin từ NGO/CSR." |
| "Tỉ lệ AI sai bao nhiêu?" | "GPT-4o-mini đạt ~85% trên test 50 ảnh đa vật liệu. Cache hash để tiết kiệm cost. User báo sai → retrain prompt." |
| "Khi nào ra mắt thật?" | "MVP đã live. Roadmap: tháng 1 — beta cộng đồng TDTU; tháng 3 — thí điểm 3 trường THPT HCM." |
| "Cạnh tranh ai?" | "Việt Nam chưa có app tương đương. Quốc tế có Trash Nothing, Recyclify — nhưng không có local data và không có gamification cho HS." |
