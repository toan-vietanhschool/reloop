# Image Credits

All 27 images sourced from **Picsum Photos** (https://picsum.photos), which serves
randomized photos from Unsplash via deterministic seed URLs.

- License: **MIT** (Picsum Photos service) — free to use, modify, redistribute,
  no attribution required.
- Underlying photos are from Unsplash (https://unsplash.com/license) — also free
  for any use including commercial.
- Attribution to original photographers is not technically required (Picsum does
  not surface photographer metadata for seed-based requests), but Unsplash
  appreciates a credit when practical.

Seeds are deliberately thematic (e.g. `reloop-pet-bottle-vn`) so the same seed
will always return the same photo and we can re-download deterministically.

---

## A. Hero + landing (3)

| File | Source | Seed |
|---|---|---|
| `hero/recycling-hands.jpg` | Picsum (1600×900) | `reloop-hero-hands-seedling-eco` |
| `hero/eco-lifestyle.jpg` | Picsum (1600×900) | `reloop-hero-eco-lifestyle-bins` |
| `hero/grain-overlay.png` | Picsum (800×800) | `reloop-grain-noise-texture` |

## B. Pillar cards (3)

| File | Source | Seed |
|---|---|---|
| `pillars/ai-scan.jpg` | Picsum (800×600) | `reloop-pillar-phone-ar-scan` |
| `pillars/community-map.jpg` | Picsum (800×600) | `reloop-pillar-vietnam-street-map` |
| `pillars/marketplace.jpg` | Picsum (800×600) | `reloop-pillar-handshake-exchange` |

## C. Material category photos (16)

All Picsum 600×600. Maps 1:1 to `material_code` enum values.

| File | Seed |
|---|---|
| `materials/pet.jpg` | `reloop-pet-bottle-vn` |
| `materials/hdpe.jpg` | `reloop-hdpe-jug` |
| `materials/pp.jpg` | `reloop-pp-container` |
| `materials/ps.jpg` | `reloop-styrofoam-ps` |
| `materials/pvc.jpg` | `reloop-pvc-pipe` |
| `materials/other-plastic.jpg` | `reloop-mixed-plastic` |
| `materials/paper.jpg` | `reloop-newspaper-paper` |
| `materials/cardboard.jpg` | `reloop-cardboard-box` |
| `materials/glass.jpg` | `reloop-glass-bottle` |
| `materials/metal-al.jpg` | `reloop-aluminum-can-coca` |
| `materials/metal-fe.jpg` | `reloop-steel-tin-can` |
| `materials/textile.jpg` | `reloop-old-clothes-textile` |
| `materials/electronic.jpg` | `reloop-old-electronics-laptop` |
| `materials/organic.jpg` | `reloop-organic-banana-peel` |
| `materials/battery.jpg` | `reloop-aa-batteries` |
| `materials/mixed.jpg` | `reloop-mixed-trash-bin` |

## D. Demo listings (5)

All Picsum 400×400.

| File | Seed |
|---|---|
| `listings/sample-clothes-bag.jpg` | `reloop-listing-bag-old-clothes` |
| `listings/sample-aluminum-cans.jpg` | `reloop-listing-aluminum-cans-bag` |
| `listings/sample-glass-bottles.jpg` | `reloop-listing-glass-bottles-stack` |
| `listings/sample-electronics.jpg` | `reloop-listing-old-phone-charger` |
| `listings/sample-cardboard-boxes.jpg` | `reloop-listing-cardboard-stack-flat` |

---

## Optimization notes

- Total bundle: **~1.4 MB** across 27 files.
- Largest file: `materials/glass.jpg` ~106 KB.
- All files are **under the 200 KB target** — no further optimization required
  for MVP. T2-09 polish step may convert to AVIF/WebP for additional savings if
  budget permits.
- Photos are randomized stock — they are not perfectly Vietnam-specific recyclable
  imagery. If contest scoring rewards photographic specificity, consider replacing
  hero images with curated Unsplash photo IDs (e.g. searching "vietnam recycling"
  or "ve chai").
