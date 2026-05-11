# ReLoop — Documentation Index

Tài liệu được nhóm theo mục đích sử dụng. Khi cần đi tìm gì, mở thư mục
tương ứng trước thay vì grep toàn bộ `docs/`.

## architecture/ — Thiết kế hệ thống

- [ARCHITECTURE.md](./architecture/ARCHITECTURE.md) — Sơ đồ tổng thể, các
  ranh giới lớn và quyết định kiến trúc cốt lõi.
- [REPO-BLUEPRINT.md](./architecture/REPO-BLUEPRINT.md) — Bố cục thư mục,
  quy ước module và path alias.

## operations/ — Triển khai, CI/CD, quan sát

- [DEPLOYMENT.md](./operations/DEPLOYMENT.md) — Hướng dẫn deploy production
  (Vercel là primary).
- [CLOUDFLARE-DEPLOY.md](./operations/CLOUDFLARE-DEPLOY.md) — Quy trình
  build + deploy `opennextjs-cloudflare` và known issues.
- [CI-CD.md](./operations/CI-CD.md) — GitHub Actions workflow + matrix.
- [SENTRY-SETUP.md](./operations/SENTRY-SETUP.md) — Cài đặt DSN, scrub PII,
  drop expected errors.
- [POSTHOG-DASHBOARD.md](./operations/POSTHOG-DASHBOARD.md) — Dashboard
  template để import vào PostHog project.

## testing/ — Test infra & test plans

- [TEST-INFRA.md](./testing/TEST-INFRA.md) — Vitest + Playwright setup,
  cấu trúc spec, ngưỡng coverage.
- [QA-PREP.md](./testing/QA-PREP.md) — 13 thẻ Q&A cho giám khảo demo.
- [RLS-TEST-PLAN.md](./testing/RLS-TEST-PLAN.md) — Kịch bản kiểm tra
  Row-Level Security với 2 user thật.

## audits/ — Đánh giá point-in-time

- [SQL-AUDIT.md](./audits/SQL-AUDIT.md) — Phân tích RLS coverage trên 14
  bảng + các findings đã fix.
- [RLS-AUDIT-CODE.md](./audits/RLS-AUDIT-CODE.md) — Audit code-side đối
  với policy bypass paths.
- [PERFORMANCE-AUDIT.md](./audits/PERFORMANCE-AUDIT.md) — Bundle size,
  LCP, INP, Web Vitals.
- [RESPONSIVE-A11Y-AUDIT.md](./audits/RESPONSIVE-A11Y-AUDIT.md) — Responsive
  layout + a11y review.
- [MOBILE-QA-NOTES.md](./audits/MOBILE-QA-NOTES.md) — Quan sát thực tế
  trên thiết bị di động.
- [BACKUP-INVENTORY.md](./audits/BACKUP-INVENTORY.md) — Inventory DB tại
  thời điểm ship Sprint 2.
- [BACKUP-PROOF.md](./audits/BACKUP-PROOF.md) — Bằng chứng snapshot.
- [CODE-REVIEW-SPRINT-2.md](./audits/CODE-REVIEW-SPRINT-2.md) — Review
  ghi chú cuối Sprint 2.

## demos/ — Tài liệu chuẩn bị demo

- [DEMO-SCRIPT.md](./demos/DEMO-SCRIPT.md) — Script demo gốc, dùng tham
  chiếu cho mọi script con.
- [DEMO-SCRIPT-BANKET.md](./demos/DEMO-SCRIPT-BANKET.md) — Bán kết, từng
  giây + Plan B/C/D/E.
- [DEMO-SCRIPT-CHUNGKET.md](./demos/DEMO-SCRIPT-CHUNGKET.md) — Chung kết.
- [DEMO-DATA.md](./demos/DEMO-DATA.md) — Dữ liệu seed cho demo.
- [T-1H-CHECKLIST.md](./demos/T-1H-CHECKLIST.md) — Checklist 60' trước
  demo.

## sprints/ — Báo cáo sprint và devlog

- [SPRINT-1-COMPLETE.md](./sprints/SPRINT-1-COMPLETE.md) — Kết quả Sprint 1.
- [SPRINT-2-COMPLETE.md](./sprints/SPRINT-2-COMPLETE.md) — Kết quả Sprint 2.
- [SPRINT-3-BACKLOG.md](./sprints/SPRINT-3-BACKLOG.md) — 22 đầu việc backlog
  cho Sprint 3.
- [DEVLOG.md](./sprints/DEVLOG.md) — Nhật ký phát triển hằng ngày.
- [stitch-recon-2026-05-09.md](./sprints/stitch-recon-2026-05-09.md) —
  Recon ghi chú ngày 9/5.

## prompts/ — AI-builder prompts & UI tooling

- [AI-BUILDERS-MATRIX.md](./prompts/AI-BUILDERS-MATRIX.md) — Ma trận
  quyết định: dùng builder nào cho luồng nào.
- [LOVABLE-PROMPT.md](./prompts/LOVABLE-PROMPT.md) — Prompt chính cho
  Lovable.dev.
- [BOLT-PROMPT.md](./prompts/BOLT-PROMPT.md) — Prompt Bolt.new.
- [V0-PROMPT.md](./prompts/V0-PROMPT.md) — 5 sub-prompt cho v0.dev.
- [ui-tooling.md](./prompts/ui-tooling.md) — Lý do bỏ Stitch MCP, dùng
  v0 + Cursor.

---

## Quy ước thêm tài liệu mới

1. Đặt file vào thư mục **mục đích** (không phải theo sprint hay theo
   tác giả). Nếu không chắc, ưu tiên `architecture/` (mô tả hệ thống) hoặc
   `audits/` (snapshot tại một thời điểm).
2. Cập nhật index này khi thêm file mới — file không xuất hiện ở đây dễ
   bị quên và mục ruỗng dần.
3. Dùng đường dẫn **tương đối** khi link sang docs khác (`../audits/X.md`),
   để chuyển vị trí trong tương lai không phải sửa nhiều nơi.
