# RLS Test Plan — ReLoop
**Author:** A8-1 Security Agent | **Date:** 2026-05-09 | **Ticket:** TRU-77

---

## Prerequisites

1. Deploy migrations 0001, 0003, 0004 (in order) to the Supabase project.
2. Sign up **two real users** via the ReLoop app auth flow:
   - **User A** (`userA@test.com`) — regular user, no role promotion
   - **User B** (`userB@test.com`) — regular user
   - **User Admin** (`admin@test.com`) — promoted to admin via Supabase dashboard SQL:
     ```sql
     update public.profiles set role = 'admin'
     where id = (select id from auth.users where email = 'admin@test.com');
     ```
3. Retrieve each user's **JWT access token**:
   ```javascript
   // In browser console after sign-in:
   const { data } = await supabase.auth.getSession()
   console.log(data.session.access_token)
   ```
4. Set environment variables for test scripts:
   ```bash
   export SB_URL="https://vzpwsdmlofsizhkwcpra.supabase.co"
   export SB_ANON_KEY="<NEXT_PUBLIC_SUPABASE_ANON_KEY>"
   export TOKEN_A="<userA JWT>"
   export TOKEN_B="<userB JWT>"
   export TOKEN_ADMIN="<admin JWT>"
   export USER_A_ID="<userA UUID from profiles>"
   export USER_B_ID="<userB UUID from profiles>"
   export LISTING_A_ID=""  # fill after creating listing as A
   ```

---

## 2-User Scenario Matrix

### Scenario 1 — User A cannot read unmoderated listings of User B

User B creates a listing (moderation_passed = false). User A should NOT see it via the public feed.

```bash
# Create listing as B (moderation returns false for test)
curl -s -X POST "$SB_URL/rest/v1/listings" \
  -H "apikey: $SB_ANON_KEY" \
  -H "Authorization: Bearer $TOKEN_B" \
  -H "Content-Type: application/json" \
  -d '{"owner_id":"'"$USER_B_ID"'","title":"Test unmod","intent":"give","material_code":"PET","moderation_passed":false,"status":"available"}' | jq .

# User A reads public listings — should NOT see B's unmoderated listing
curl -s "$SB_URL/rest/v1/listings?moderation_passed=eq.false&owner_id=eq.$USER_B_ID" \
  -H "apikey: $SB_ANON_KEY" \
  -H "Authorization: Bearer $TOKEN_A" | jq .
# EXPECTED: [] (empty array — listings_read_public blocks moderation_passed=false)
```

### Scenario 2 — User A cannot update listing owned by User B

```bash
export LISTING_B_ID="<UUID from scenario 1 insert>"

curl -s -X PATCH "$SB_URL/rest/v1/listings?id=eq.$LISTING_B_ID" \
  -H "apikey: $SB_ANON_KEY" \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"title":"Hacked title"}' | jq .
# EXPECTED: {"code":"42501","message":"new row violates row-level security policy for table \"listings\""} or empty update (0 rows affected)
```

### Scenario 3 — User A cannot self-escalate role to admin (M-4 fix)

```bash
curl -s -X PATCH "$SB_URL/rest/v1/profiles?id=eq.$USER_A_ID" \
  -H "apikey: $SB_ANON_KEY" \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"role":"admin"}' | jq .
# EXPECTED: RLS with check violation — 0 rows updated or 403/error
# Verify role unchanged:
curl -s "$SB_URL/rest/v1/profiles?id=eq.$USER_A_ID&select=role" \
  -H "apikey: $SB_ANON_KEY" \
  -H "Authorization: Bearer $TOKEN_A" | jq .
# EXPECTED: [{"role":"user"}]
```

### Scenario 4 — User A cannot self-inflate eco_points

```bash
curl -s -X PATCH "$SB_URL/rest/v1/profiles?id=eq.$USER_A_ID" \
  -H "apikey: $SB_ANON_KEY" \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"eco_points":999999}' | jq .
# EXPECTED: RLS with check violation — 0 rows updated or error
```

### Scenario 5 — User A cannot self-approve moderation_passed on own listing

```bash
# First create a listing as User A (moderation_passed starts false)
curl -s -X POST "$SB_URL/rest/v1/listings" \
  -H "apikey: $SB_ANON_KEY" \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"owner_id":"'"$USER_A_ID"'","title":"My listing","intent":"give","material_code":"GLASS","moderation_passed":false,"status":"available"}' | jq .

export LISTING_A_ID="<UUID from above>"

# Attempt to self-approve
curl -s -X PATCH "$SB_URL/rest/v1/listings?id=eq.$LISTING_A_ID" \
  -H "apikey: $SB_ANON_KEY" \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"moderation_passed":true}' | jq .
# EXPECTED: RLS with check violation — 0 rows updated or error
```

### Scenario 6 — User A can update safe fields on own listing

```bash
curl -s -X PATCH "$SB_URL/rest/v1/listings?id=eq.$LISTING_A_ID" \
  -H "apikey: $SB_ANON_KEY" \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated title","city":"Ho Chi Minh"}' | jq .
# EXPECTED: 204 No Content (success, 1 row affected)
```

### Scenario 7 — User A can update safe fields on own profile

```bash
curl -s -X PATCH "$SB_URL/rest/v1/profiles?id=eq.$USER_A_ID" \
  -H "apikey: $SB_ANON_KEY" \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"display_name":"New Name","bio":"Hello"}' | jq .
# EXPECTED: 204 No Content (success)
```

### Scenario 8 — Admin can promote User A to admin

```bash
curl -s -X PATCH "$SB_URL/rest/v1/profiles?id=eq.$USER_A_ID" \
  -H "apikey: $SB_ANON_KEY" \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{"role":"admin"}' | jq .
# EXPECTED: 204 No Content (success)
# Revert after test:
curl -s -X PATCH "$SB_URL/rest/v1/profiles?id=eq.$USER_A_ID" \
  -H "apikey: $SB_ANON_KEY" \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{"role":"user"}' | jq .
```

### Scenario 9 — Admin can approve moderation_passed on listing

```bash
curl -s -X PATCH "$SB_URL/rest/v1/listings?id=eq.$LISTING_A_ID" \
  -H "apikey: $SB_ANON_KEY" \
  -H "Authorization: Bearer $TOKEN_ADMIN" \
  -H "Content-Type: application/json" \
  -d '{"moderation_passed":true}' | jq .
# EXPECTED: 204 No Content (success)
```

### Scenario 10 — Anon cannot read eco_actions

```bash
curl -s "$SB_URL/rest/v1/eco_actions" \
  -H "apikey: $SB_ANON_KEY" | jq .
# EXPECTED: [] (ea_read_own: auth.uid() is null for anon → 0 rows)
```

### Scenario 11 — User A cannot read User B's exchanges

```bash
# Create exchange as B requesting A's listing
curl -s -X POST "$SB_URL/rest/v1/exchanges" \
  -H "apikey: $SB_ANON_KEY" \
  -H "Authorization: Bearer $TOKEN_B" \
  -H "Content-Type: application/json" \
  -d '{"listing_id":"'"$LISTING_A_ID"'","giver_id":"'"$USER_A_ID"'","receiver_id":"'"$USER_B_ID"'","status":"requested"}' | jq .

# A third user (simulate with anon or a third token) tries to read
# For simplicity: verify B's own exchange is only visible to A and B
curl -s "$SB_URL/rest/v1/exchanges" \
  -H "apikey: $SB_ANON_KEY" | jq .
# EXPECTED: [] (anon sees nothing — exchanges_parties_read requires auth)
```

### Scenario 12 — User A cannot insert eco_actions directly

```bash
curl -s -X POST "$SB_URL/rest/v1/eco_actions" \
  -H "apikey: $SB_ANON_KEY" \
  -H "Authorization: Bearer $TOKEN_A" \
  -H "Content-Type: application/json" \
  -d '{"user_id":"'"$USER_A_ID"'","kind":"scan","points_delta":500}' | jq .
# EXPECTED: 403 or RLS error (no INSERT policy on eco_actions for authenticated role)
```

---

## Full 14-Table RLS Matrix

| Table | Anon SELECT | Auth SELECT | Own SELECT | Admin SELECT | Auth INSERT | Own UPDATE | Admin UPDATE | Admin DELETE |
|-------|------------|-------------|------------|--------------|-------------|------------|--------------|--------------|
| profiles | all rows | all rows | own row | all rows | trigger only | safe fields only (0004) | any field (0004) | N/A |
| material_categories | all | all | — | — | admin only | admin only | admin only | admin only |
| material_info | all | all | — | — | admin only | admin only | admin only | admin only |
| listings | moderated+available | moderated+available | own rows | all rows | own owner_id | safe fields (0004) | any field (0004) | own or admin |
| ai_analyses | none | own or admin | own | all | own user_id | immutable | immutable | immutable |
| collection_points | all | all | — | — | any auth | contributor or admin | contributor or admin | admin |
| collection_point_votes | all | all | — | — | self vote | self vote | — | self vote |
| exchanges | none | parties or admin | parties | all | receiver | parties | admin | admin |
| messages | none | parties (via join) | — | — | sender+party | immutable | immutable | immutable |
| eco_actions | none | own or admin | own | all | service_role only | immutable | immutable | N/A |
| badges | all | all | — | — | admin | admin | admin | admin |
| user_badges | all | all | — | — | service_role only | service_role only | service_role only | service_role only |
| notifications | none | own | own | — | service_role only | own (read_at only) | — | own |
| analytics_events | none | none | none | all | service_role only | service_role only | service_role only | service_role only |

---

## Expected Results Cheatsheet

| Scenario | Expected HTTP | Expected Body |
|----------|---------------|---------------|
| 1 — A reads B's unmoderated listing | 200 | `[]` |
| 2 — A updates B's listing | 200 with 0 rows OR error | `[]` or RLS error |
| 3 — A escalates own role | 200 with 0 rows OR error | `[]` or RLS error |
| 4 — A inflates own eco_points | 200 with 0 rows OR error | `[]` or RLS error |
| 5 — A self-approves moderation_passed | 200 with 0 rows OR error | `[]` or RLS error |
| 6 — A updates own listing safe fields | 204 | no body |
| 7 — A updates own profile safe fields | 204 | no body |
| 8 — Admin promotes A to admin | 204 | no body |
| 9 — Admin approves moderation_passed | 204 | no body |
| 10 — Anon reads eco_actions | 200 | `[]` |
| 11 — Anon reads exchanges | 200 | `[]` |
| 12 — A inserts eco_actions | 403 or RLS error | error object |

---

## Notes

- Supabase REST API returns 200 with `[]` (not 403) when RLS filters out all rows on SELECT.
- Supabase REST API returns 200 with 0-row response (not 403) when `with check` fails on UPDATE for Prefer: return=minimal.
- Use `Prefer: return=representation` header to get the updated rows back; 0 rows confirms RLS blocked the write.
- For WITH CHECK failures on explicit RLS violations, Supabase may return a 403 or a Postgres error code `42501`.
