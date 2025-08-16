We are implementing Phase 0: Foundation (repo hygiene + emulator smoke).

## Implementation scope
- Ensure Firebase emulator smoke test exists and passes.
- Ensure Firestore rules file exists and is loaded by emulator.
- Ensure lint/typecheck scripts exist in package.json and work with Turbo.
- Ensure CI:local script (pure pnpm + firebase emulators) is available.
- Do NOT include paid services, keep everything local-first.

## Exit Criteria
- `firebase emulators:exec --only firestore,auth "pnpm -w vitest run"` passes.
- `pnpm turbo type-check` passes.
- `pnpm turbo lint` passes.
- No caches/artifacts tracked by Git; .gitignore covers them.

## Codebase layout (target)
- apps/web (Next.js app router)
- packages/contracts (shared TS, test)
- apps/functions (Firebase functions; just compile ok)
- root scripts for CI:local

## Produce:
- Only source/config edits required to meet Exit Criteria.