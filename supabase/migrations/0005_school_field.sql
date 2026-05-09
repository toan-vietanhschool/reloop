-- =============================================================
-- ReLoop — Profile school field + schools reference table
-- Ticket: TRU-82 / T2-02
-- =============================================================
-- Adds:
--   1. profiles.school (nullable text) + partial index for non-null filter
--   2. public.schools reference table (code/name/city) + RLS
--   3. Seed of 12 THPT lớn HCM/HN + "OTHER"
--
-- Notes:
--   - school is left as free text instead of FK to schools.code so that the
--     application can accept a wider list later without a destructive migration
--     on profiles. Application-level allowlist (actions/profile.setSchool)
--     keeps writes constrained to seeded codes.
--   - Partial index avoids bloat from the ~null majority of rows in early demo
--     while making leaderboard `where school = ?` queries cheap.
-- =============================================================

alter table public.profiles add column if not exists school text;
create index if not exists profiles_school_idx
  on public.profiles(school) where school is not null;

create table if not exists public.schools (
  code text primary key,
  name_vi text not null,
  city text not null,
  created_at timestamptz default now()
);

alter table public.schools enable row level security;

drop policy if exists "read all schools" on public.schools;
create policy "read all schools" on public.schools for select using (true);

drop policy if exists "admin write schools" on public.schools;
create policy "admin write schools" on public.schools
  for all using (public.is_admin()) with check (public.is_admin());

insert into public.schools (code, name_vi, city) values
  ('THPT-LE-QUY-DON-HCM', 'THPT Lê Quý Đôn', 'Hồ Chí Minh'),
  ('THPT-NGUYEN-THUONG-HIEN', 'THPT Nguyễn Thượng Hiền', 'Hồ Chí Minh'),
  ('THPT-LE-HONG-PHONG-HCM', 'THPT chuyên Lê Hồng Phong', 'Hồ Chí Minh'),
  ('THPT-TRAN-DAI-NGHIA', 'THPT chuyên Trần Đại Nghĩa', 'Hồ Chí Minh'),
  ('THPT-GIA-DINH', 'THPT Gia Định', 'Hồ Chí Minh'),
  ('THPT-NGUYEN-DU-HCM', 'THPT Nguyễn Du', 'Hồ Chí Minh'),
  ('THPT-NGUYEN-HUE-HN', 'THPT chuyên Nguyễn Huệ', 'Hà Nội'),
  ('THPT-CHU-VAN-AN-HN', 'THPT Chu Văn An', 'Hà Nội'),
  ('THPT-AMS', 'THPT chuyên Hà Nội - Amsterdam', 'Hà Nội'),
  ('THPT-PHAN-DINH-PHUNG', 'THPT Phan Đình Phùng', 'Hà Nội'),
  ('THPT-VIET-DUC', 'THPT Việt Đức', 'Hà Nội'),
  ('THPT-LY-THUONG-KIET-HN', 'THPT Lý Thường Kiệt', 'Hà Nội'),
  ('OTHER', 'Trường khác', 'Khác')
on conflict (code) do nothing;
