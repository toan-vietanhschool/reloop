# ReLoop — Poster A1 Brief

> Print size: A1 (594 × 841 mm), 300 DPI. Designed in Figma; this brief is the
> source of truth for headline, palette, copy, and asset hierarchy.

---

## Visual direction

- Style: editorial / brutalist hybrid — big type, anchored grid, one hero photo.
- Palette:
  - Primary: deep green `#166534` (background dominant).
  - Accent: warm yellow `#FBBF24` (used only in the headline emphasis).
  - Body text: warm white `#F5F5F0` on green.
  - Stat callouts: alert red `#EF4444`.
- Type:
  - Display headline: a Vietnamese-friendly serif or display sans (e.g. Inter Display 900 or Playfair 800). Track tight, leading 0.95.
  - Body: Geist or system sans 400.

---

## Headline (top half)

> **Chai nhựa này sống lâu hơn ông cố bạn 5 đời.**

Subhead (one line, smaller):

> Nó cũng sẽ sống lâu hơn bạn — trừ khi bạn quét nó với ReLoop.

Visual: full-bleed photo of a single PET bottle on a beach, slight grain overlay.
Headline overlaps the photo edge so it reads "into" the bottle silhouette.

---

## 3 stat bullets (middle band)

Render as 3 columns, equal weight, with red number + white label.

| Number | Label |
| ------ | ----- |
| **1.8 triệu tấn** | nhựa Việt Nam ra biển mỗi năm |
| **27%** | nhựa được tái chế ở TP.HCM |
| **73%** | rác chưa qua xử lý đúng cách |

Caption beneath: *Nguồn: VnExpress, Bộ TN&MT 2024–2025.*

---

## CTA band (bottom third)

3 short sentences, one per line:

1. Chụp 1 ảnh. Biết tất cả.
2. AI Vision Scan + bản đồ điểm thu gom + marketplace tái chế.
3. Mỗi hành động = +Eco Coin → badges → leaderboard trường.

---

## QR codes (bottom-right block)

Two square QRs, ~80 mm each, with labels beneath:

- **[QR Vote]** — Bình chọn ReLoop tại cuộc thi → `https://[contest-vote-url]`
- **[QR App]** — Mở ReLoop ngay → `https://reloop-mvp.vercel.app`

(Generate via Vercel-friendly QR lib or `qr-server.com` once URLs are final.)

---

## Footer (very small, 8pt)

- Team: ReLoop — TDTU Vibe Coding 2026
- Members: Sev7n Nguyen + A1–A8 multi-agent dev
- License: MIT · Source: github.com/reloop-tdtu
- Contact: hello@reloop.app · @reloop_tdtu

---

## Production checklist

- [ ] Bleed: 5mm on all sides (export with crop marks).
- [ ] CMYK conversion before sending to printer (sRGB will look muddy).
- [ ] Headline fits at viewing distance ~3m — test by printing A4 mock-up.
- [ ] No data on a black/dark hero overlay below 50% contrast.
- [ ] QR codes tested with a real phone camera before going to print.
- [ ] Vietnamese diacritics preserved — verify font supports `ơ ư đ ấ ệ ữ ử ú`.
