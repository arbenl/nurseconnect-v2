# Phase: Auth & Roles

## Implementation Tasks
1) NextAuth.js with Firebase (credentials or email link) and session population.
2) Signup/Login pages under apps/web/src/app/(auth)/...
3) Middleware or server components to protect /dashboard.
4) Minimal roles helper and Firestore profile creation hook.

## Exit Criteria
- All new tests pass with: `pnpm run ci:phase`
- `firebase emulators:exec --only firestore,auth --project demo-nurseconnect "pnpm -w vitest run"` passes.
- Lint/typecheck remain clean.

## Output Format (IMPORTANT)
Return only JSON with an 'ops' array following the supported operations (ensureDir, writeFile, mergeJson, addDeps, run, print).
