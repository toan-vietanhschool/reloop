# ReLoop — DB Backup Proof (Pre-Final 2026-05-29)

**Date:** 2026-05-10 (Sprint 2 SHIP) — backup ritual scheduled for 2026-05-29.
**Project:** vzpwsdmlofsizhkwcpra (Supabase)

---

## Method

Supabase MCP **does not expose** a `create_backup` or snapshot tool in the
currently loaded toolset (verified: only `list_tables`, `execute_sql`,
`apply_migration`, `list_migrations`, `list_branches`, `create_branch`).
Backup must therefore be triggered manually via the Supabase Dashboard.

---

## Manual backup steps (run T-1d before Chung kết)

1. Open https://supabase.com/dashboard/project/vzpwsdmlofsizhkwcpra
2. Sidebar → **Project Settings** → **Database** → **Backups** tab
3. Click **"Create snapshot"** (free tier: 7-day retention; Pro: 30-day PITR)
4. **Name the snapshot:** `pre-final-2026-05-29`
5. Wait until snapshot status = **Ready** (~2–5 minutes)
6. Screenshot the Backups tab showing the snapshot row and save as
   `docs/BACKUP-PROOF.png` in this repo
7. Download `.sql` dump as secondary backup:
   - **Project Settings → Database → Connection string → Direct connection**
   - Run locally:
     ```bash
     pg_dump "postgresql://postgres.vzpwsdmlofsizhkwcpra:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres" \
       --no-owner --no-acl > docs/backup-pre-final-2026-05-29.sql
     ```
   - DO NOT commit the `.sql` (contains real seed data) — store offline only

---

## Recovery rehearsal (recommended T-2d)

1. Create new Supabase project `reloop-restore-test`
2. Restore from `pre-final-2026-05-29.sql` via SQL Editor
3. Verify row counts match `docs/audits/BACKUP-INVENTORY.md`
4. Smoke test: list 5 listings, 5 collection points, 1 leaderboard query
5. Delete the restore-test project after verification

---

## Branch backup (Supabase MCP available)

Alternative: create a Supabase **branch** (point-in-time copy) using MCP:

```ts
mcp__supabase__create_branch({
  project_id: "vzpwsdmlofsizhkwcpra",
  name: "pre-final-2026-05-29"
})
```

Branches cost $0.32/day. Delete after Chung kết.
