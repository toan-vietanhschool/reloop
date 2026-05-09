# ReLoop — DB Inventory Snapshot

**Captured:** 2026-05-10 via Supabase MCP `list_tables({ schemas: ["public"] })`.
**Project:** vzpwsdmlofsizhkwcpra
**Purpose:** baseline row counts for backup integrity verification.

---

## Public schema tables (15 total, all RLS-enabled)

| Table | Rows | RLS | Notes |
| ----- | ----:| --- | ----- |
| `profiles` | 10 | yes | Demo accounts + admin |
| `material_categories` | 16 | yes | Seed (PET, HDPE, PP, PVC, glass, paper, metal, etc.) |
| `material_info` | 16 | yes | Vietnamese localized seed |
| `listings` | 30 | yes | Mix approved + pending + rejected |
| `ai_analyses` | 0 | yes | Empty (cache-only after first scan) |
| `collection_points` | 25 | yes | Seeded HCM/HN |
| `collection_point_votes` | 0 | yes | Empty until users vote |
| `exchanges` | 0 | yes | C2C exchange records |
| `messages` | 0 | yes | 1-1 chat (Sprint 3 deferred) |
| `eco_actions` | 50 | yes | Audit trail of all point-earning actions |
| `badges` | 5 | yes | First Scan, Pin Pioneer, Trade 5, School Hero, Streak 7 |
| `user_badges` | 0 | yes | Empty until users unlock |
| `notifications` | 0 | yes | Push notif queue |
| `analytics_events` | 0 | yes | Server-side PostHog mirror |
| `schools` | 13 | yes | TDTU + 12 THPT/ĐH HCM |

**Total rows in public:** 165

---

## Migration history (4 applied)

| Version | Filename (current on disk) | Description |
| ------- | -------------------------- | ----------- |
| 0001 | `0001_init.sql` | 14 tables + RLS + audit triggers + seed |
| 0003 | `0003_points_rpc.sql` | `award_points()` RPC + level-up logic |
| 0004 | `0004_rls_hardening.sql` | Default-deny policies + admin helper |
| 0005 | `0005_school_field.sql` | Profiles.school_id FK |
| 0006 | `0006_badge_helpers.sql` | Badge unlock helpers (Sprint 2 T2-03) |
| 0007 | `0007_listings_moderation_reason.sql` | Moderation reason text (Sprint 2 T2-04) |
| 0008 | `0008_user_banned.sql` | Banned user flag + audit (Sprint 2 T2-04) |
| 0009 | `0009_admin_audit.sql` | **Renamed from `0006_admin_audit.sql`** (collision fix) |

> Note: 0002 reserved for an earlier attempt and superseded by 0003.
> Supabase tracks migrations by name (not order), so the rename is safe.

---

## Critical SECURITY DEFINER functions (must remain)

- `handle_new_user()` — auth trigger (creates profile on signup)
- `is_admin(uuid)` — RLS helper (used by all admin policies)
- `award_points(uuid, text, int)` — points engine (writes to eco_actions)
- `unlock_badge(uuid, text)` — badge helper (Sprint 2)
- `check_and_award_badges(uuid)` — badge auto-check after action

5 SECURITY DEFINER warnings in Supabase advisors are EXPECTED and SAFE.

---

## Storage buckets

| Bucket | Public | Notes |
| ------ | ------ | ----- |
| `listings` | yes (read) | Photo upload for marketplace |
| `scans` | no | AI scan input (server-only) |
| `avatars` | yes (read) | Profile photos |

---

## Edge Functions

None deployed. All logic in Server Actions / Route Handlers.

---

## Cron Jobs

| Path | Schedule | Notes |
| ---- | -------- | ----- |
| `/api/cron/leaderboard` | Daily 00:00 UTC+7 | Refresh leaderboard materialized view (Sprint 2 T2-02) |

---

## Recovery test data (use after restore)

| Test ID | Expected count after restore |
| ------- | ---------------------------- |
| `SELECT count(*) FROM profiles` | 10 |
| `SELECT count(*) FROM listings` | 30 |
| `SELECT count(*) FROM collection_points` | 25 |
| `SELECT count(*) FROM eco_actions` | 50 |
| `SELECT count(*) FROM badges` | 5 |
| `SELECT count(*) FROM schools` | 13 |
