# Demo Data — Bán kết Prep

> Ticket: TRU-80 / T1-10 polish phase. Seed file: `supabase/seed-demo.sql`.

## What's seeded

| Object              | Count | Notes                                                                          |
| ------------------- | ----- | ------------------------------------------------------------------------------ |
| `auth.users`        | 10    | Fixed UUIDs `11111111-1111-4111-8111-00000000000{1..10}`. Emails `demo{N}@reloop.app`. |
| `public.profiles`   | 10    | Auto-created by `on_auth_user_created`, then enriched (eco_points, school bio, city). |
| `public.listings`   | 30    | 15 HCM + 15 Hà Nội. Material mix covers all 16 enum codes. `moderation_passed=true`. |
| `public.eco_actions`| 50    | 5 actions per profile. Mix of `scan / listing_create / point_pin / vote`.       |
| Extra `collection_points` | 5  | `verified=false`, `contributed_by` set — to test admin verify flow.        |

The 20 baseline `collection_points` already exist via the main `seed.sql` (HCM + HN points).

## Demo accounts

| Email              | Password (placeholder) | Display name        | eco_points | City   |
| ------------------ | ---------------------- | ------------------- | ---------- | ------ |
| demo1@reloop.app   | demo-password-1        | Eco Hero 1          | 480        | TP.HCM |
| demo2@reloop.app   | demo-password-2        | Bạn Xanh 2          | 320        | TP.HCM |
| demo3@reloop.app   | demo-password-3        | Tái Chế Sĩ 3        | 210        | TP.HCM |
| demo4@reloop.app   | demo-password-4        | Cô Gái Compost      | 175        | TP.HCM |
| demo5@reloop.app   | demo-password-5        | Anh Chàng Đổi Đồ    | 150        | TP.HCM |
| demo6@reloop.app   | demo-password-6        | Cây Xanh Tuổi 17    | 110        | Hà Nội |
| demo7@reloop.app   | demo-password-7        | Mẹ Kiếp Phế Liệu    | 85         | Hà Nội |
| demo8@reloop.app   | demo-password-8        | Lớp Trưởng Eco      | 50         | Hà Nội |
| demo9@reloop.app   | demo-password-9        | Tiểu Đội Trồng Cây  | 25         | Hà Nội |
| demo10@reloop.app  | demo-password-10       | Cô Bé Phân Loại     | 5          | Hà Nội |

> The `encrypted_password` is set via `crypt()` in `seed-demo.sql`, but Supabase's
> auth gate may still require a live login flow. If a demo account refuses to log
> in, reset the password from the Supabase dashboard before going live.

## How it was applied

1. The seed script ran via the **Supabase MCP `execute_sql`** tool against the
   `reloop-mvp` project (id `vzpwsdmlofsizhkwcpra`).
2. Three statements ran in order:
   1. Insert 10 rows into `auth.users` (the trigger creates 10 `profiles`).
   2. `update profiles set ...` to fill `display_name / eco_points / level / city / bio`.
   3. Insert 30 listings + 50 eco_actions + 5 user-pinned `collection_points`.

## Reset (before re-running)

```sql
-- Run with service_role only.
delete from public.eco_actions
 where user_id::text like '11111111-1111-4111-8111-%';

delete from public.collection_points
 where contributed_by::text like '11111111-1111-4111-8111-%';

delete from public.listings
 where owner_id::text like '11111111-1111-4111-8111-%';

-- Removing the auth user cascades to profiles (FK ON DELETE CASCADE).
delete from auth.users
 where id::text like '11111111-1111-4111-8111-%';
```

After the reset, re-apply `supabase/seed-demo.sql` to repopulate.

## Demo prep checklist

- [ ] Run `seed-demo.sql` in a clean staging DB.
- [ ] Confirm `/listings` shows 30 cards.
- [ ] Confirm `/leaderboard` ranks the 10 demo profiles.
- [ ] Confirm `/map` includes the 5 unverified user-pinned points.
- [ ] Reset passwords from the Supabase dashboard if you plan to log in as a demo.
- [ ] Print laptop sticker from `docs/DEMO-CREDENTIALS.md`.
