# Phase: Post-Launch Ops

## Implementation Tasks
- Describe and implement code changes required to achieve: Ops runbooks, budgets, alerts, log conventions.
- Keep ops safe to apply on top of existing monorepo (apps/web, apps/functions, packages/*).

## Exit Criteria
- All new tests pass with: `pnpm run ci:phase`
- `firebase emulators:exec --only firestore,auth --project demo-nurseconnect "pnpm -w vitest run"` passes.
- Lint/typecheck remain clean.

## Output Format (IMPORTANT)
Return only JSON with an 'ops' array following the supported operations (ensureDir, writeFile, mergeJson, addDeps, run, print).
