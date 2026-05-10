-- 0011_demo_listings_photos.sql
-- B2: Backfill demo listings with material image URLs from public/images/materials/
-- Idempotent: only updates listings whose photos array is empty/null.
-- Safe re-run: WHERE clause skips any user-uploaded photos.

-- Step 1: Set photos to the matching per-material image for all empty listings.
-- material_code enum values map directly to lowercase, hyphenated filenames:
--   PET -> pet.jpg, METAL_AL -> metal-al.jpg, OTHER_PLASTIC -> other-plastic.jpg, etc.
update listings
set photos = array['/images/materials/' || lower(replace(material_code::text, '_', '-')) || '.jpg']
where photos is null
   or array_length(photos, 1) is null
   or array_length(photos, 1) = 0;

-- Step 2: Sprinkle 5 themed sample-listing photos for variety.
-- Each sample image is themed to a material category. We prepend it so the sample
-- becomes the cover image, followed by the generic material image.
-- Pick 1 listing per category by deterministic ordering (created_at + id) so re-runs
-- are stable; use a single pass per sample to keep the migration simple/idempotent.

-- Helper CTE-based update: only update listings that currently hold a single material image
-- (i.e. they were just backfilled in Step 1 — never user-uploaded multi-photo listings).
with picks as (
  select id, material_code,
         row_number() over (partition by material_code order by created_at, id) as rn
  from listings
  where array_length(photos, 1) = 1
)
update listings l
set photos = array['/images/listings/sample-clothes-bag.jpg'] || l.photos
from picks p
where l.id = p.id and p.material_code = 'TEXTILE' and p.rn = 1;

with picks as (
  select id, material_code,
         row_number() over (partition by material_code order by created_at, id) as rn
  from listings
  where array_length(photos, 1) = 1
)
update listings l
set photos = array['/images/listings/sample-cardboard-boxes.jpg'] || l.photos
from picks p
where l.id = p.id and p.material_code = 'CARDBOARD' and p.rn = 1;

with picks as (
  select id, material_code,
         row_number() over (partition by material_code order by created_at, id) as rn
  from listings
  where array_length(photos, 1) = 1
)
update listings l
set photos = array['/images/listings/sample-aluminum-cans.jpg'] || l.photos
from picks p
where l.id = p.id and p.material_code = 'METAL_AL' and p.rn = 1;

with picks as (
  select id, material_code,
         row_number() over (partition by material_code order by created_at, id) as rn
  from listings
  where array_length(photos, 1) = 1
)
update listings l
set photos = array['/images/listings/sample-glass-bottles.jpg'] || l.photos
from picks p
where l.id = p.id and p.material_code = 'GLASS' and p.rn = 1;

with picks as (
  select id, material_code,
         row_number() over (partition by material_code order by created_at, id) as rn
  from listings
  where array_length(photos, 1) = 1
)
update listings l
set photos = array['/images/listings/sample-electronics.jpg'] || l.photos
from picks p
where l.id = p.id and p.material_code = 'ELECTRONIC' and p.rn = 1;
