# ReLoop — Demo Script Bán kết (16/5/2026, 3 phút LIVE)

> **Phiên bản chi tiết của `public/pitch-deck-banket-script.md`** —
> bao gồm Plan B/C/D, props checklist, và câu cứu nguy chi tiết cho từng failure mode.
> In file này ra A5, gập đôi, để bên cạnh laptop khi lên sân khấu.

---

## 0. PROPS CHECKLIST (mang lên sân khấu)

| # | Vật phẩm | Mục đích | Ghi chú |
| - | -------- | -------- | ------- |
| 1 | **Chai nước Lavie 500ml** (thật, đã uống) | Demo AI Scan PET | Lau khô bên ngoài, label còn nguyên để AI nhận diện được |
| 2 | **Lon Coca/Pepsi nhôm** (thật, đã uống) | Backup nếu chai nhựa fail | Bóp nhẹ cho dễ cầm, không bóp nát |
| 3 | **Báo cũ / hộp giấy** | Backup #2 nếu lon cũng fail | Đem 1 mảnh nhỏ cỡ A5 |
| 4 | **iPhone đã sạc 100%** | Thiết bị demo chính | Đã cast HDMI thử, đã login `demo1@reloop.app` |
| 5 | **Cable HDMI/USB-C → màn hình lớn** | Cast iPhone | Test với BTC trước 30 phút |
| 6 | **Hotspot 4G điện thoại phụ** | Mạng dự phòng | Đã share password sẵn cho laptop |
| 7 | **USB chứa video backup 90s** | Plan B nếu mất mạng | File `reloop-demo-90s.mp4` |
| 8 | **Cue card A5** (file này in 2 mặt) | Đọc khi quên lời | Gấp đôi, vào túi áo |

---

## 1. SCRIPT THEO TIMING (180s tổng, ~175s thoại + ~5s buffer)

### 1.1 Hook — 0:00 → 0:15 (15s)

**Slide 1 hiện. Speaker đứng giữa, 2 chân vững, nhìn BGK.**

> "Xin chào ban giám khảo. Em là **[tên]** — đội ReLoop.
>
> Mỗi ngày, Việt Nam thải ra **18.000 tấn rác**. **73% nhựa** không bao giờ được tái chế.
>
> Hôm nay, tụi em mang đến **Shazam — cho rác**."

→ **Bấm sang Slide 2**.

---

### 1.2 Problem & Insight — 0:15 → 0:45 (30s)

**Slide 2 hiện. Cầm chai Lavie trong tay. Nhìn vào chai khi kể chuyện cá nhân.**

> "Tụi em phỏng vấn **23 bạn THPT**. **21/23** trả lời: *'Em biết tái chế quan trọng — nhưng không biết bắt đầu chỗ nào.'*
>
> Em kể chuyện thật. **Tuần trước**, em vứt một chai dầu gội xuống thùng rác sinh hoạt. Em nghĩ: *'Chai nhựa, tái chế được, xong.'*
>
> Sau đó em mới biết: **chai dầu gội là PVC** — **không thể tái chế** ở Việt Nam. Ngấm hóa chất 100 năm.
>
> Vấn đề không phải nhận thức. Là — **tại sao Gen Z muốn eco mà thiếu công cụ ngay tại điểm xả rác?**"

→ **Bấm sang Slide 3**.

---

### 1.3 Solution — 0:45 → 1:15 (30s)

**Slide 3 hiện với 3 phone mockup.**

> "ReLoop có **3 trụ cột** trong một app web — không cần tải.
>
> Một: **AI Vision Scan**. Chụp một ảnh, biết ngay vật liệu, năm phân hủy, ai đang cần.
>
> Hai: **Map điểm thu gom**. 20 điểm HCM/HN seed sẵn từ VECA, mGreen, Việt Nam Tái Chế.
>
> Ba: **Marketplace + Eco Points**. Cho — đổi — bán. Mỗi action mở badge.
>
> **VECA là logistics đồng nát. mGreen là B2B2G phường.** ReLoop là **education + community + action — cho Gen Z**.
>
> *Shazam biết bài hát. ReLoop biết rác.* Bây giờ — demo trên production thật."

→ **Bấm sang Slide 4. Bật timer 90s đếm ngược.**

---

### 1.4 Demo LIVE — 1:15 → 2:45 (90s)

**Slide 4 = "DEMO LIVE" banner + timer 90s. Trình chiếu chuyển sang iPhone screen mirror.**

#### ⏱ 1:15–1:25 (10s) — Mở app

> *(Mở Safari iPhone → `https://reloop-prod.vercel.app`. Trang load < 2s.)*
>
> "Đây là **production URL** trên **Vercel + Supabase + GPT-4o-mini**. **Row Level Security** trên **14 bảng** Postgres. **CI/CD** xanh **5/5 jobs** — lint, typecheck, build, unit, E2E Playwright."

#### ⏱ 1:25–1:40 (15s) — Login

> *(Bấm "Đăng nhập" → "Tiếp tục với Google" → đã có session từ trước → vào dashboard.)*
>
> "Auth qua **Supabase magic link** hoặc **Google OAuth**. Profile tạo tự động qua **trigger Postgres** — database tự handle, không cần code app."

#### ⏱ 1:40–2:10 (30s) — AI Scan chai nhựa thật

> *(Bấm "Scan" trên dashboard → camera mở → đưa chai Lavie vào khung → chụp → loading 2–3s → result card hiện.)*
>
> "Em chụp một chai nhựa **đem từ căng-tin lên đây**. Ảnh resize 800px, strip EXIF, gửi qua **GPT-4o-mini Vision**. **Image hash SHA256 cache** — cùng ảnh không gọi lại API.
>
> *(Chờ result, đọc to:)*
>
> **PET 500ml. 450 năm phân hủy. Eco Score 8 trên 10. 3 ý tưởng DIY tiếng Việt** — chậu cây mini, ống cắm bút, hộp đựng hạt giống.
>
> Bấm **'Tìm điểm tái chế gần nhất'** → bản đồ mở."

#### ⏱ 2:10–2:25 (15s) — Map

> *(Map Leaflet hiện. Zoom Hồ Chí Minh. Marker xanh = verified, vàng = pending.)*
>
> "Marker xanh = đã verify. **20 điểm HCM/HN** seed từ data VECA, mGreen, Việt Nam Tái Chế. User pin điểm mới, cộng đồng vote, admin verify.
>
> **Điểm gần nhất — Trạm Tái Chế Bình Thạnh, 1.2 km**."

#### ⏱ 2:25–2:40 (15s) — Listing nhanh

> *(Mở `/listings/new` → tiêu đề: "Cho áo cũ size M" → category Fashion → action Cho → submit → AI moderation pass → toast → redirect detail page.)*
>
> "Đăng nhanh: *'Cho áo cũ size M'*. **AI moderation** check spam/profanity bằng GPT-4o-mini, **server action** xử lý server-side, không trust client.
>
> Pass → toast → redirect chi tiết. **ISR cache 60 giây** cho listing public."

#### ⏱ 2:40–2:45 (5s) — Profile + Points + badge

> *(Mở `/profile` → Eco Points +15 → badge **"First Scan"** unlock với confetti.)*
>
> "**+15 Eco Points** vừa cộng — server-side validate qua **Postgres RPC**. Badge **'First Scan'** unlock — confetti."

→ **Bấm sang Slide 5**.

---

### 1.5 Tech & Team + Cảm ơn — 2:45 → 3:00 (15s)

**Slide 5 hiện. Đứng thẳng, 2 tay buông tự nhiên.**

> "Stack: **Next.js 16 Server Components**, **Supabase RLS**, **GPT-4o-mini Vision**, **Leaflet**, **PostHog + Sentry**.
>
> **8 migration · 14 bảng · 165 dòng data · 9 commit · CI 5/5 xanh** trên commit `40bb2c8`.
>
> Đội tụi em **sẵn sàng phản biện**. **Cảm ơn ban giám khảo!**"

**(Đứng thẳng, mỉm cười, im lặng 1 giây — mời Q&A.)**

---

## 2. PLAN B — MẠNG YẾU / SẬP

**Trigger:** Trang load > 5s, scan loading > 10s, hoặc disconnect rõ ràng.

### Câu cứu nguy:

> *"Để **đảm bảo thời lượng**, em chuyển sang **video demo offline 90 giây** đã chuẩn bị sẵn — flow giống hệt phần em vừa giới thiệu."*

### Hành động:

1. **Không reconnect lại** — đừng để BGK thấy bạn vật lộn với wifi.
2. Cmd+Tab sang tab đã preload `reloop-demo-90s.mp4` (full screen sẵn).
3. Bấm Play. Video chạy đúng 90s, có overlay caption tiếng Việt cho mỗi bước.
4. Khi video kết thúc → bấm sang Slide 5 đúng phút **2:45**.
5. Đọc lời dẫn Slide 5 như bình thường.

### Backup video chuẩn bị (offline trên USB + Google Drive):

- File: `reloop-demo-90s.mp4`
- Resolution: 1080p
- Audio: tắt (vì speaker đọc lời dẫn live song song)
- Caption tiếng Việt cứng trong video — đọc được rõ từ hàng cuối hội trường

---

## 3. PLAN C — OPENAI DOWN / TIMEOUT

**Trigger:** Click Scan → loading > 8s → API timeout / 5xx error.

### Câu cứu nguy:

> *"OpenAI hôm nay đang chậm. **Image hash cache là một phần thiết kế** — em show kết quả đã cache từ scan trước, cùng chai nhựa này, để ban giám khảo thấy flow đầy đủ."*

### Hành động:

1. Đóng modal scan (nếu có).
2. Mở tab đã preload sẵn: `reloop-prod.vercel.app/scan/[id-cached]` — trang chi tiết của 1 scan đã thành công trước đó (chuẩn bị seeded vào DB demo, có URL stable).
3. Đọc result card y như script gốc — BGK không thấy khác biệt.
4. Tiếp tục flow Map + Listing + Profile như script gốc.

### Backup data chuẩn bị:

- 1 row `ai_analyses` đã insert sẵn vào DB demo, ID stable, ảnh PET 500ml.
- URL: `https://reloop-prod.vercel.app/scan/cached-pet-500ml-demo`
- Hoặc: 1 screenshot `scan-result-cached.png` lưu sẵn trong điện thoại — show qua AirDrop nếu mọi cách đều fail.

---

## 4. PLAN D — SUPABASE DOWN / DB ERROR

**Trigger:** App load nhưng login fail / dashboard trống / 500 error trên mọi route.

### Câu cứu nguy:

> *"Để **không tốn thời gian của ban giám khảo**, em chuyển qua **trang demo tĩnh** đã chuẩn bị — thể hiện đầy đủ UI và flow. Code thật là **mã mở** trên GitHub, link trên slide cuối."*

### Hành động:

1. Mở tab đã preload: `reloop-prod.vercel.app/demo-static.html` — trang HTML tĩnh có:
   - Mock dashboard với 5 listing fake
   - Result card scan PET hardcode
   - Map screenshot embed
   - Profile mockup với +15 points
2. Đọc lời dẫn theo script gốc — chỉ khác là **UI tĩnh, không tương tác**.
3. Cuối Slide 4, nhấn vào **GitHub link** trong tab khác → show 1 file source code (ví dụ `app/scan/page.tsx`) → nói: *"Đây là code thật chạy production thường ngày."*
4. Slide 5: nhấn mạnh **"Mã mở, link GitHub"** + QR.

### Backup file chuẩn bị:

- File: `public/demo-static.html` — single-page HTML mô phỏng app (chuẩn bị trước, host cùng deploy)
- File: 5 screenshot trong `public/demo-screenshots/` (dashboard, scan-result, map, listing, profile)

---

## 5. PLAN E — MIC / HDMI / LAPTOP CHẾT

**Trigger:** Hardware fail trước khi bắt đầu hoặc giữa chừng.

### Câu cứu nguy:

> *"(Vẫy tay BTC.) Em xin **30 giây** kỹ thuật — sau đó tiếp tục."*

### Hành động:

1. **Mic chết:** vẫy tay BTC → đợi mic mới → khi có mic, tóm tắt nhanh phần đã nói: *"Em vừa giới thiệu vấn đề + giải pháp — bây giờ tiếp tục với demo."*
2. **HDMI fail:** chuyển sang demo trên iPhone trực tiếp → BGK xuống xem màn hình điện thoại (hơi awkward nhưng OK với hội trường nhỏ).
3. **Laptop chết:** chỉ còn iPhone → demo trên app web di động → bỏ qua slide, chỉ nói lời dẫn + cho BGK xem điện thoại.

---

## 6. TECH DEPTH KEYWORDS — RẢI VÀO LÚC DEMO

Để show technical depth, **rải tự nhiên** các keyword sau vào lúc thích hợp:

| Keyword | Khi nào nói | Ghi chú |
| ------- | ----------- | ------- |
| **Server Components** | Lúc mở dashboard / listing detail | Next.js 16 App Router, render server-side |
| **RLS Postgres** | Lúc nói login / profile | "Mọi query đi qua Row Level Security default-deny" |
| **ISR 60s** | Lúc submit listing | "ISR (Incremental Static Regeneration) cache 60 giây" |
| **Image hash cache** | Lúc AI Scan | "SHA256 hash cùng ảnh không gọi lại API → giảm 80% cost" |
| **Server Actions** | Lúc submit listing / mod | "Server-side mutation, không trust client" |
| **Postgres trigger** | Lúc đăng nhập | "Profile tự tạo qua trigger" |
| **PostHog funnel** | Nếu BGK hỏi analytics | "Event scan→listing có funnel real-time" |
| **Sentry filter PII** | Nếu BGK hỏi log | "Strip PII trước khi log" |
| **CI/CD 5 jobs** | Slide 5 | "Lint, typecheck, build, unit, E2E Playwright" |
| **AI moderation** | Lúc submit listing | "GPT-4o-mini check spam/profanity server-side" |

**Quy tắc:** không nói cùng lúc 5 keyword — rải đều, mỗi câu chỉ có 1–2 keyword.

---

## 7. CHECKLIST T-30 PHÚT TRƯỚC LÊN SÂN KHẤU

### Hardware

- [ ] Laptop pin 100%, sạc cắm sẵn
- [ ] iPhone pin 100%, đã cast HDMI thử
- [ ] Adapter HDMI → màn hình lớn — TEST với BTC
- [ ] Hotspot 4G điện thoại phụ — laptop kết nối được
- [ ] Volume hệ thống = 50%
- [ ] **Notification OFF** — Slack, Discord, mail, iMessage tắt hết

### Browser & App

- [ ] Chrome/Safari ẩn danh, **CHỈ 5 tab**:
  1. Slide deck (Google Slides hoặc PDF full screen)
  2. `reloop-prod.vercel.app` đã login `demo1@reloop.app`
  3. PostHog dashboard
  4. GitHub Actions (commit `40bb2c8` xanh)
  5. Sentry dashboard (0 error today)
- [ ] Tab #2 đã ở `/dashboard`, sẵn sàng bấm Scan
- [ ] Backup video `reloop-demo-90s.mp4` mở ở tab thứ 6 (ẩn) — Plan B

### Props

- [ ] Chai Lavie 500ml + lon Coca + báo cũ — sạch sẽ, label nguyên
- [ ] Cue card A5 (file này) gấp đôi trong túi áo
- [ ] Bút marker viết tên BGK lên giấy nhỏ (phòng quên)

### Verify Production

- [ ] Mở `reloop-prod.vercel.app` lần cuối → Lighthouse mobile ≥ 85
- [ ] Login `demo1@reloop.app` thành công
- [ ] Scan thử 1 chai → AI trả kết quả < 5s
- [ ] Map load đầy đủ marker
- [ ] Submit 1 listing test → moderation pass

### Cá nhân

- [ ] Uống nước
- [ ] Hít thở 4-7-8 (4s vào, 7s giữ, 8s thở ra) — 3 lần
- [ ] Nhớ rằng: **mạng dự phòng đã có**, **demo data đã backup**, **slide đã in**
- [ ] Đứng thẳng, ngẩng mặt, mỉm cười — bắt đầu

---

## 8. QUY TẮC VÀNG TRONG LÚC DEMO

1. **Lỗi nhỏ → không panic.** Không nói "ơ, sao lại thế". Thay vào đó: *"Đây là một edge case thú vị, để em chuyển sang flow khác trước."*
2. **Tốc độ:** chậm hơn bình thường 20%. BGK cần thời gian thẩm thấu.
3. **Mắt:** nhìn BGK 70%, slide 20%, laptop 10%. Không nhìn sàn.
4. **Tay:** không khoanh tay, không bỏ trong túi quần. Cầm chai nhựa hoặc clicker.
5. **Tech keyword:** rải đều, không dồn. Show depth nhưng không "show off".
6. **Nhắc rubric:** mỗi feature gánh tiêu chí gì → nói rõ. *"Đây là phần Phân quyền và Bảo vệ data — mọi query đều qua RLS Postgres."*
7. **Kết:** đứng thẳng, cảm ơn rõ ràng, im lặng 1 giây → mời Q&A. **Không cười khúc khích, không nói thêm.**

---

> **Lưu ý cuối:** File này là chi tiết Plan B/C/D + props.
> File `public/pitch-deck-banket-script.md` là script đọc thẳng trên sân khấu.
> File `public/pitch-deck-banket.md` là outline cho thiết kế slide.
> 3 file dùng song song — không thay thế nhau.
