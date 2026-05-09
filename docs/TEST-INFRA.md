# ReLoop — Test Infrastructure

## CI Status

![CI](https://github.com/YOUR_ORG/reloop/actions/workflows/ci.yml/badge.svg)

## Test Types

### Unit Tests (Vitest + Testing Library)

**What they cover:** Individual functions, React components, custom hooks, utility modules.

**Location:** `tests/unit/**/*.test.{ts,tsx}`

**Run locally:**
```bash
pnpm test              # single run
pnpm test:watch        # watch mode
pnpm test:coverage     # with coverage report
```

**Coverage threshold:** 80% for branches, functions, lines, and statements (enforced in CI).

### E2E Tests (Playwright)

**What they cover:** Critical user flows exercised against a running Next.js server across Chromium, Firefox, and WebKit.

**Location:** `tests/e2e/**/*.spec.ts`

**Run locally (requires the dev server to be running, or Playwright will start it):**
```bash
pnpm e2e           # headless
pnpm e2e:ui        # Playwright interactive UI
```

**CI status:** E2E job is deferred to T2-06 / TRU-86 once a stable Vercel preview URL is available. The stub spec `tests/e2e/landing.spec.ts` is RED until T1-04 ships the landing page.

## Current RED Tests

| Test file | Ticket | Will turn GREEN when |
|---|---|---|
| `tests/unit/hello.test.tsx` | T1-01 | `app/page.tsx` renders text matching `/ReLoop/i` |
| `tests/e2e/landing.spec.ts` | T1-04 | Landing page ships and `text=ReLoop` is visible |

## Configuration Files

| File | Purpose |
|---|---|
| `vitest.config.ts` | Vitest + jsdom + coverage-v8 + `@/` alias |
| `playwright.config.ts` | 3-browser matrix, retries on CI, artifacts |
| `tests/setup.ts` | `@testing-library/jest-dom` + `next/navigation` stub |
| `.github/workflows/ci.yml` | 4 parallel jobs: lint, typecheck, build, test |
