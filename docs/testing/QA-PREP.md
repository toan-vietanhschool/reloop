# ReLoop — Q&A Prep Chung kết

> 7 câu hỏi BGK có thể hỏi (theo Playbook Phần 11.3) + script trả lời tiếng Việt.
> Mỗi câu trả lời ≤ 30 giây. Practice cho đến khi nói trôi không cần nhìn.

---

## Q1: "Mô hình kinh doanh là gì? Khi nào có doanh thu?"

**Script (≤ 30s):**

> "Phase 1 hiện tại: free cho user — focus growth + EPR data quality.
> Phase 2 (Q3 2026): Featured điểm thu gom có phí cho doanh nghiệp tái chế
> + Sponsored Eco Coin từ NGO/brand CSR (ví dụ Coca-Cola Việt Nam đang
> chi $5M/năm cho EPR compliance — ReLoop là kênh đo lường chính xác).
> Phase 3 (Q3 2027): B2B EPR Data API cho FMCG brand cần báo cáo Bộ TN&MT.
> Total Addressable Market $2B đến 2030."

---

## Q2: "Tỉ lệ AI sai bao nhiêu? Sai sai thì sao?"

**Script (≤ 30s):**

> "GPT-4o-mini đạt ~85% accuracy trên test set 50 ảnh đa vật liệu (PET,
> HDPE, PP, PVC, glass, paper, metal). Khi user nghi ngờ kết quả → bấm
> 'Báo sai' → log vào table `ai_analyses` để retrain prompt. Cache hash
> SHA256 đảm bảo cùng 1 ảnh → cùng kết quả (deterministic). Khi OpenAI
> down → fallback về stub deterministic, app vẫn chạy. Confidence score
> < 70% sẽ hiện badge 'Cần xác nhận'."

---

## Q3: "Khi nào ra mắt thật? Roadmap 3 tháng tới?"

**Script (≤ 30s):**

> "MVP đã LIVE tại reloop-mvp.vercel.app. 3 tháng tới: thí điểm 5 trường
> THPT HCM (Lê Hồng Phong, Nguyễn Thượng Hiền, Nguyễn Thị Minh Khai,
> Phổ Thông Năng Khiếu, Trần Đại Nghĩa). Mục tiêu 1.000 user active,
> 1 tấn rác có data nguồn. Q3 2026: mở rộng Hà Nội + Đà Nẵng. Q4 2026:
> ký pilot với 1 brand FMCG (đang tiếp xúc Vinamilk + Tân Hiệp Phát)."

---

## Q4: "Cạnh tranh ai? Tại sao là các bạn chứ không phải đội khác?"

**Script (≤ 30s):**

> "Việt Nam: chưa có app nào kết hợp đủ AI Vision + Map cộng đồng +
> Marketplace + EPR data. Quốc tế: Trash Nothing (US), Recyclify (UK)
> — nhưng không có local Vietnamese data, không có Gen Z gamification.
> Lợi thế của ReLoop: native Vietnamese từ ngày 1, integration EPR
> Việt Nam 2024, partnership trường THPT, và **stack production-grade
> từ ngày 1** (PostHog, Sentry, RLS, CI/CD). 14 ngày 1 dev + 12 AI
> agent ship được = lợi thế tốc độ."

---

## Q5: "AI viết hết phải không? Các bạn làm gì?"

**Script (≤ 30s):**

> "AI viết khoảng 70% code (đo bằng commit log audit), 30% là em.
> Quan trọng hơn: **AI không tự quyết định** kiến trúc. Em là conductor:
> - Đọc playbook → 20 issue Linear
> - Phân chia 4 wave parallel cho 12 agent
> - Code review từng PR (HIGH/CRITICAL fix tay)
> - Quyết định trade-off (RLS default-deny, ISR cache, prompt versioning)
> - Test thật trên iPhone + Android
> Đây là tương lai dev — 1 người + 12 AI > 5 người không AI."

---

## Q6: "Bảo mật user data thế nào? RLS có thật không?"

**Script (≤ 30s):**

> "**Default-deny** trên cả 15 table. Mọi query phải có policy mới được
> đọc. User không thể đọc data user khác (kiểm tra qua test plan
> `RLS-TEST-PLAN.md`). Listing moderation dùng service-role key (server-side
> only), không expose anon. Không lưu password (magic link + OAuth).
> Sentry filter PII trước khi log. Cookie banner cho GDPR + Nghị định 13/2023
> Việt Nam. Audit trail 100% admin action vào table `analytics_events`."

---

## Q7: "Nếu không trúng giải, các bạn làm tiếp không?"

**Script (≤ 30s):**

> "Có. ReLoop không phải là project thi — là một MVP thật. Em đã đăng ký
> domain reloop.vn, đang viết application cho VinaCapital Ventures Seeding
> ($50k angel cho social impact startup), và 2 tuần nữa pitch CES Vietnam
> 2026. Source code MIT, public, mọi đóng góp welcome. Nếu trúng giải —
> tiền đi vào partnership trường THPT (in poster + 100 chai mẫu). Nếu không
> — em vẫn ship. Đây không phải là về cuộc thi. Là về 1.8 triệu tấn nhựa."

---

## Bonus prep — Câu hỏi khó hơn

### Q8: "Privacy GPT-4o lưu ảnh user không?"

> "OpenAI API tier (không phải ChatGPT consumer): zero retention 30 ngày
> theo TOS. Không train trên data API. Hơn nữa, em chỉ gửi ảnh đã resize
> 800px max + strip EXIF (không có GPS). Cache hash SHA256 = nếu cùng ảnh
> em không gọi lại API → giảm 80% data exposure."

### Q9: "Cost run app này / tháng?"

> "Vercel Hobby free, Supabase free tier (500MB DB, 1GB storage). OpenAI
> ước $50/month cho 10k user (cache 80% giúp giảm cost). PostHog free tier
> 1M event/month. Sentry free 5k error/month. **Total: <$100/month đến
> 10k user.** Khi pass 10k user mới cần upgrade."

### Q10: "Tại sao chọn Next 16 chứ không phải React Native / Flutter?"

> "Next 16 PWA — install lên home screen iOS/Android không cần app store
> review (24h vs 2 tuần). Server Components giảm bundle 40%. SEO landing
> page tốt hơn native. Một codebase web + mobile + desktop. Thi 14 ngày
> không có thời gian maintain 2 codebase."

---

## Câu hỏi nâng cao — BGK chuyên môn cao

### Q11: "Bạn dùng Cloudflare hay Vercel? Tại sao?"

**Script (≤ 30s):**

> "Em dùng **cả hai — production trên Vercel, edge experiment trên Cloudflare Workers**.
> Vercel là default cho Next.js — Server Components hoạt động tốt nhất, ISR ổn,
> đã tích hợp PostHog + Sentry. Cloudflare Workers em deploy qua
> `@opennextjs/cloudflare` adapter làm experiment cho edge global, nhưng có
> **bug SSR** với một số route động — chưa fix kịp cho Bán kết nên hôm nay
> demo trên Vercel. **Production URL** là `reloop-prod.vercel.app`,
> Cloudflare URL `reloop.vibecode-academy.workers.dev` để BGK xem stack
> đa-platform. Trade-off: Vercel cold start 200ms nhưng DX tốt; Cloudflare
> 50ms cold start nhưng adapter chưa stable. Roadmap Q3: migrate sang
> Cloudflare hoàn toàn khi adapter mature."

---

### Q12: "Migration RLS 0004 hardening — bạn audit gì?"

**Script (≤ 30s):**

> "Migration `0004_rls_hardening.sql` em làm 3 việc:
> **(1) Default-deny** trên cả **14 bảng** — không có policy thì query fail,
> không phải fallback open;
> **(2) Service-role separation** — chỉ moderation logic + admin audit dùng
> service-role key, expose qua server action chứ không client;
> **(3) Anon write blocked** — anon role chỉ SELECT trên `material_info`
> public, mọi INSERT/UPDATE/DELETE phải authenticated.
> Em đã viết test trong `RLS-TEST-PLAN.md` — kiểm tra user A
> không đọc được listing draft của user B, không update được points của
> profile khác, không xoá scan của người khác. Chạy `pnpm test:rls` xanh.
> Ngoài ra `0008_user_banned.sql` thêm flag để admin ban user mà không xoá
> data — audit trail đi qua bảng `admin_audit` trong migration `0009`."

---

### Q13: "AI Vision Scan có hallucinate không? Test với bao nhiêu ảnh?"

**Script (≤ 30s):**

> "Có rủi ro hallucinate — em xử lý 3 lớp.
> **(1) Test set 50 ảnh** đa vật liệu (PET, HDPE, PP, PVC, glass, paper,
> nhôm, hỗn hợp). Accuracy đo bằng so sánh với ground truth labels —
> đạt **~85%** đúng material code, ~92% đúng trong "tái chế được hay không".
> Sai chủ yếu ở PVC vs PETG (cả hai đều trong suốt) và HDPE đục vs PP.
> **(2) Schema validation** — response phải match Zod schema, có
> `confidence_score` < 0.7 thì UI hiện badge **'Cần xác nhận'**, không
> auto-cộng Eco Points.
> **(3) Bảng `material_info`** seed 30 dòng từ Bộ TN&MT là **source of truth**
> — AI chỉ bổ sung DIY ideas, không override material data. User báo sai
> qua nút 'Báo sai' → log vào `ai_analyses.user_feedback` để retrain prompt.
> `temperature=0.2`, prompt versioning trong code, mỗi version có A/B test."

---

## Practice script trước Chung kết

1. Đọc to từng câu trả lời 5 lần (ghi âm + nghe lại)
2. Mỗi câu < 30s — bấm timer kiểm tra
3. Trả lời với tone tự tin nhưng không cocky
4. Bắt đầu bằng acknowledge câu hỏi: "Câu hỏi rất hay, ạ. Em xin trả lời như sau..."
5. Kết bằng câu chốt rõ ràng — không lan man
