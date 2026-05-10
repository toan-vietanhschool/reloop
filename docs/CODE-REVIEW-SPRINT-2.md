# Code Quality Review — Sprint 2

---

## Quality Re-review 2026-05-10

Reviewer: code-reviewer agent (Claude Sonnet 4.6)
Commit: f777259
Scope: app/, components/, actions/, lib/ — maintainability only (security reviewed separately)

---

### [HIGH] components/scan/ResultCard.tsx:75 + EcoScoreCard.tsx:47 — `impactEmoji` duplicated verbatim

**Issue:** `impactEmoji(score)` is copy-pasted identically (same thresholds, same emoji literals) across two sibling files. Both files also independently implement a `Math.floor(years / 25)` generations calculation with the magic constant `25` unextracted. The comment in `EcoScoreCard.tsx:57` explicitly acknowledges the duplication (`"mirrors ResultCard.tsx"`), which is a code smell that should trigger extraction, not documentation.

**Recommendation:** Extract `impactEmoji` and the `YEARS_PER_GENERATION = 25` constant into `lib/scan-display.ts` (or a co-located `scan-utils.ts`). Both components import from there.

**Effort:** S

---

### [HIGH] app/(admin)/admin/points/page.tsx:31 + components/admin/ModerationTable.tsx:42 — `formatRelative` still fully duplicated

**Issue:** Entire `formatRelative` utility — including the `RTF = new Intl.RelativeTimeFormat(...)` constant, the `REL_UNITS` array, and the function body — is copy-pasted between a Server Component page and a Client Component. This was flagged in the Sprint 2 review and has not been extracted. Any locale or threshold change must be applied in two places.

**Recommendation:** Move to `lib/format-relative.ts`, export `formatRelative`. Both files then import it. Since one is a Server Component and the other a Client Component, the utility must remain a plain function with no React dependency (which it already is).

**Effort:** S

---

### [HIGH] app/(admin)/admin/users/page.tsx:54 — `select("*")` on `profiles` with no row limit

**Issue:** The users admin page fetches all profiles with `.select("*")` and a `.limit(500)` only on the preceding `listings` pre-query, not on the `profiles` fetch itself (line 54). On a table that can grow arbitrarily, this is an unbounded read that will eventually time out or OOM the Edge Function.

**Recommendation:** Add `.limit(200)` and cursor-based pagination to the profiles query, or switch to a paginated server action. The `.limit(500)` on the listings query is also high; consider 100 for an admin list.

**Effort:** M

---

### [MEDIUM] components/scan/EcoScoreCard.tsx — `CARD_PX = 1080` and pixel constants are unnamed magic numbers scattered inline

**Issue:** `CARD_PX` (line 32) is extracted as a constant, but values like `64` (padding), `32` (gap), `320` (hero image size), `220` (ring size), `18` (stroke), and `56` / `28` / `22` (font sizes) appear inline throughout the JSX with no named binding. The comment in `ScoreRing` explains the geometry formula but not the choice of `220` or `18`. Changing the card layout requires hunting down every literal.

**Recommendation:** Extract a `CARD_LAYOUT` object at the top of the file (alongside `COLORS`) holding the geometry constants: `heroPx`, `ringSizePx`, `ringStrokePx`, `paddingPx`, `gapPx`. This keeps the card as one file (justified for a self-contained PNG capture component) while making resizing auditable.

**Effort:** S

---

### [MEDIUM] lib/openai/vision.ts:223,238,407 — `console.warn` in production server code

**Issue:** Three `console.warn` calls remain in `persistAnalysis` and the no-hash scan path. These emit to the server log on every failed insert or failed points award, which is acceptable as observability, but: (1) they leak internal table names (`ai_analyses`) and internal error messages to server stdout, (2) they are inconsistent with the project's use of structured error objects everywhere else, (3) the project TypeScript rule (`typescript/coding-style.md`) explicitly prohibits `console.*` in production.

**Recommendation:** Replace with a minimal structured logger (even `process.stderr.write(JSON.stringify({level:'warn', msg, ...ctx}))` is better) or add a `lib/logger.ts` wrapper. At minimum, strip the raw Supabase error message before emitting.

**Effort:** S

---

### [MEDIUM] actions/badges.ts:112 — `console.warn` in production action

**Issue:** Same pattern as vision.ts — `console.warn("notifications.insert failed:", notifError.message)` leaks the Supabase error string to stdout.

**Recommendation:** Same logger wrapper as above. Consolidate with the vision.ts fix in a single `lib/logger.ts` pass.

**Effort:** S (combined with vision.ts fix)

---

### [LOW] components/scan/EcoScoreCard.tsx:57 + ResultCard.tsx:92 — "mirrors" comment as a duplication admission

**Issue:** The comment `"25 years per generation, mirrors ResultCard.tsx"` is effectively a TODO that says "this code is duplicated and I know it." Once the HIGH duplication finding above is resolved, this comment becomes stale.

**Recommendation:** Remove the comment when extracting the shared constant; the shared import is self-documenting.

**Effort:** XS

---

### [LOW] actions/listings.ts — `as never` cast used 4 times

**Issue:** The workaround for `supabase-js` v2.105 generic narrowing to `never` is explained in an inline comment, which is correct. However, four separate casts in one file with varying comment coverage creates noise. The comment on line 219 is comprehensive; lines 224, 266, 357, and 386 repeat the cast without always repeating the rationale.

**Recommendation:** The comment coverage is adequate for now. Track extraction of a typed `db.insert<T>()` wrapper in Sprint 3 backlog to eliminate the pattern entirely once the supabase-js generic is fixed upstream.

**Effort:** L (deferred)

---

## Summary

| Severity | Count |
|----------|-------|
| CRITICAL | 0 |
| HIGH | 3 |
| MEDIUM | 2 |
| LOW | 2 |

**Verdict:** APPROVE_WITH_REFACTOR — no production-breaking issues. The three HIGH items are maintainability debt that will compound if left past Sprint 3 (duplication grows with new admin pages, unbounded query will hit limits at scale).

