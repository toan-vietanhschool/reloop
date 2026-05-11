# ReLoop — T-1H Checklist (Chung kết 30/5)

> Print A5 cue card. Đọc CHẬM 1 tiếng trước khi vào hội trường.
> Nếu bất kỳ item nào fail → fix ngay, không skip.

---

## T-60 phút — Hardware

- [ ] **Laptop sạc đầy 100%** (cắm sạc liên tục từ giờ trở đi)
- [ ] **Cáp HDMI** + adapter USB-C (backup)
- [ ] **Phone sạc đầy 100%** (làm hotspot 4G dự phòng)
- [ ] **Hotspot 4G** test bật + connect laptop OK
- [ ] **Phone thứ 2** (nếu có) — backup demo trên phone
- [ ] **Chai nhựa thật** (PET trong suốt) — clean, label rõ
- [ ] **Mouse rời** (Bluetooth pair sẵn) — không demo bằng trackpad

---

## T-45 phút — Software

- [ ] **Chrome ẩn danh** + clear cache
- [ ] **5 tab mở sẵn** đúng thứ tự:
  1. Pitch deck Slides full-screen
  2. https://reloop-mvp.vercel.app (production)
  3. PostHog dashboard (https://app.posthog.com/...)
  4. GitHub Actions tab (https://github.com/toan-vietanhschool/reloop/actions — all green)
  5. Sentry dashboard (https://sentry.io/... — 0 errors)
- [ ] **Tab production** đăng nhập sẵn `demo1@reloop.app`
- [ ] **3 backup video preload** ở Downloads:
  - `backup-demo-3min.mp4` (full demo Plan B)
  - `backup-cached-scan.mp4` (Plan C OpenAI down)
  - `backup-30s-tldr.mp4` (Plan emergency)
- [ ] **Slack / Discord / Mail / Teams** TẤT CẢ đã quit
- [ ] **Notification** OFF toàn hệ thống (Mac: Focus mode On)
- [ ] **Volume hệ thống = 50%** (test bằng cách mở 1 video YouTube)

---

## T-30 phút — Demo data verify

- [ ] **Production prod** load OK trong < 3s (mở `/` → check)
- [ ] **Login demo1** thành công, redirect dashboard
- [ ] **Scan flow:** mở `/scan` → camera permission OK
- [ ] **Listings:** ít nhất 5 listing approved hiện trên `/listings`
- [ ] **Map:** 25 collection point hiện trên `/map`
- [ ] **Leaderboard:** top 20 user hiện, TDTU filter có data
- [ ] **Admin:** login admin → 3 tab hiện đầy đủ (pending listings, pending pins, banned)
- [ ] **Share modal:** scan → share button → modal 1080×1080 render đúng

---

## T-15 phút — Run-through

- [ ] Practice **deck 5 phút** lần cuối — bấm timer
- [ ] Practice **3 câu hỏi BGK** ngẫu nhiên (Q1, Q4, Q7 từ `QA-PREP.md`)
- [ ] Hít thở sâu 3 phút
- [ ] Uống nước (KHÔNG cà phê — đã đủ adrenaline)
- [ ] Đi WC

---

## T-10 phút — Sân khấu

- [ ] Vào hội trường, kết nối HDMI projector
- [ ] **Resolution 1920×1080** (KHÔNG 4K — sẽ blur trên projector cũ)
- [ ] **Mirror display** (KHÔNG extend) — slides + demo trên cùng 1 screen
- [ ] **Test slide 1** (Cover) full-screen — verify font + color đúng
- [ ] **Test slide 5** (Demo) — verify browser hiện đúng, không crash
- [ ] **Test audio** nếu có video backup play (volume 50%)
- [ ] Cầm chai nhựa sẵn ở tay phải — NGAY khi gọi tên đội

---

## T-0 — Lên sân khấu

**Trước khi click slide 1:**

1. Đứng thẳng, mỉm cười với BGK
2. Nói "Xin chào ban giám khảo" rõ ràng
3. Đợi 2 giây — eye contact 3 thầy cô
4. Click slide 1 → bắt đầu script

**Trong khi demo:**

- Nói chậm (tốc độ thường × 0.85)
- Không turn lưng vào BGK quá 5s
- Khi switch tab — nói lời dẫn, không click im lặng
- Mỗi 30s nhìn BGK 1 lần (không nhìn screen suốt)

---

## Plan emergency cuối cùng

Nếu ALL fail (mạng, laptop, projector cùng lúc):

1. Đứng giữa sân khấu, cầm chai nhựa
2. Nói: "Thưa BGK, kỹ thuật đang lỗi. Em xin demo bằng câu chuyện."
3. Kể 60 giây story:
   > "Chai này 450 năm. ReLoop 3 giây. App em build 14 ngày
   > tại reloop-mvp.vercel.app — quét QR slide cuối là tự thử."
4. Mở phone, demo trực tiếp cho 3 BGK
5. Cảm ơn → ngồi xuống

**Quan trọng:** không panic, không xin lỗi 5 lần, không đứng im. Story > tech.

---

## Sau khi xong

- [ ] Lưu pitch deck final + 3 backup video lên Google Drive
- [ ] Screenshot PostHog + Sentry + GitHub Actions làm proof
- [ ] Update DEVLOG entry "Sprint 2 SHIP" cuối ngày
- [ ] Email cảm ơn BTC
- [ ] Ngủ. Quên kết quả. Đợi BTC công bố.
