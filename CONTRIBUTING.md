# Contributing to ReLoop

## Commit Message Format

Follow Conventional Commits:

```
<type>: <description>

<optional body>
```

**Types**: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`

**Examples:**
```
feat: T1-02 — add AI Vision scan endpoint with GPT-4o integration
fix: T1-05 — resolve auth redirect loop on OAuth callback
refactor: T2-08 — extract eco-score calculation into utility function
docs: update README with quick start steps
test: add unit tests for listing moderation
```

## Branch Naming

```
feat/T1-NN-short-slug
fix/T2-NN-short-slug
refactor/T3-NN-short-slug
```

Example: `feat/T1-02-ai-vision-scan`

## PR Process

1. **Open PR** with title matching commit message
2. **Link Linear issue** in description (TRU-NN)
3. **List AI prompts used** (Claude, ChatGPT, v0.dev) — required for Vibe Coding rubric
4. **Add manual changes** section (what YOU wrote vs AI)
5. **Pass CI** (ESLint, TypeScript, tests must be green)
6. **Get 1 reviewer approval**
7. **Squash + merge** → closes Linear issue automatically

## Code Quality Checklist

Before pushing:

- [ ] Functions ≤ 50 lines, files ≤ 800 lines
- [ ] No hardcoded secrets (use `.env.local`)
- [ ] No `console.log` (use logger or remove)
- [ ] 80%+ test coverage for new code
- [ ] ESLint + TypeScript pass: `pnpm lint && pnpm typecheck`
- [ ] No deep nesting (≤4 levels)

## Testing

```bash
pnpm test           # Run all unit tests
pnpm test:watch     # Watch mode
pnpm test:coverage  # Coverage report
pnpm e2e            # Run E2E tests
```

Minimum: 80% coverage. Write tests first (TDD).

## Issue Tracking

**Linear board**: [ReLoop MVP](https://linear.app/truongvietanh/project/reloop-mvp-tdtu-vibe-coding-2026-cca1b358d64d)

Create feature/bug tickets there → generates Linear issue number (TRU-XX) → use in branch + commit + PR.

---

**Note:** Every PR must document AI tool usage for Vibe Coding finals demonstration.
