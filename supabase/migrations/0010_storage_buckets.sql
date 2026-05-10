-- Migration: 0010_storage_buckets
-- Date: 2026-05-10
-- Author: ReLoop Bot (autonomous fix for "Bucket not found" upload error)
--
-- Creates the two public Storage buckets used by ReLoop and their RLS
-- policies on storage.objects. This was previously deferred to manual
-- Supabase dashboard setup, but Storage is required for both AI Vision
-- Scan (T1-06) and Listings photo upload (T1-05). Without this, browser
-- uploads fail with `Bucket not found` because the anon-key client
-- cannot create buckets (only service_role can, via the deferred
-- `provisionScansBucket()` Server Action).
--
-- Idempotent: ON CONFLICT update keeps deploys safe.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('scans',    'scans',    true, 2097152, array['image/jpeg','image/png','image/webp']),
  ('listings', 'listings', true, 2097152, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ===== RLS policies on storage.objects =====
-- (RLS is enabled by default on storage.objects by Supabase.)

-- Anyone (incl. anon) can read objects in the two public buckets.
drop policy if exists "public read scans+listings" on storage.objects;
create policy "public read scans+listings" on storage.objects
for select
using (bucket_id in ('scans','listings'));

-- Authenticated users can upload only into their own user-id folder
-- (path pattern: <auth.uid()>/<filename>).
-- This prevents user A from clobbering user B's uploads.
drop policy if exists "authenticated upload to own folder" on storage.objects;
create policy "authenticated upload to own folder" on storage.objects
for insert to authenticated
with check (
  bucket_id in ('scans','listings')
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

-- Owners can update their own objects (rename, metadata change).
drop policy if exists "owner update own objects" on storage.objects;
create policy "owner update own objects" on storage.objects
for update to authenticated
using (
  bucket_id in ('scans','listings')
  and owner = (select auth.uid())
)
with check (
  bucket_id in ('scans','listings')
  and owner = (select auth.uid())
);

-- Owners (or admins) can delete their own objects.
drop policy if exists "owner or admin delete own objects" on storage.objects;
create policy "owner or admin delete own objects" on storage.objects
for delete to authenticated
using (
  bucket_id in ('scans','listings')
  and (owner = (select auth.uid()) or public.is_admin())
);
