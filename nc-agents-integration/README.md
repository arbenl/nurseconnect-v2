# NurseConnect Agents Integration (Bundle)
This bundle aligns with your `Makefile`, `scripts/agent-runner.mjs`, and `scripts/apply-plan.mjs` workflow.

## Install
Unzip this at your repo root:
```
unzip nc-agents-integration.zip -d ./
```

## Files
- `scripts/agent-runner.mjs` — runs a Gemini agent with a context + phase prompt, writes `output/<task>/<AGENT>.plan.json`.
- `scripts/apply-plan.mjs` — applies plan JSON via supported ops (write files, merge JSON, add deps, run commands).
- `prompts/context_*.md` — master contexts for dev/qa/security/ops.
- `prompts/<phase>.md` — phase prompts (0..8).
- `Makefile` — convenience targets (plan, plan-all, apply, full-phase).

## Typical flow
```bash
# 0) ensure node >=20 and pnpm installed
node -v && pnpm -v

# 1) generate plans for phase 1
make plan-all TASK=1-auth-roles

# 2) inspect plans under output/1-auth-roles/
# 3) apply in order
node scripts/apply-plan.mjs output/1-auth-roles/DEV.plan.json
node scripts/apply-plan.mjs output/1-auth-roles/SECURITY.plan.json
node scripts/apply-plan.mjs output/1-auth-roles/OPS.plan.json

# 4) run QA plan (dry to see steps, then real)
node scripts/apply-plan.mjs output/1-auth-roles/QA.plan.json --dry-run
node scripts/apply-plan.mjs output/1-auth-roles/QA.plan.json

# 5) verify
pnpm run ci:phase
firebase emulators:exec --only firestore,auth --project demo-nurseconnect "pnpm -w vitest run"
```

## Supported Plan Operations
- ensureDir, writeFile, appendFile
- mergeJson (deep), addDeps
- run, print

> Keep plans idempotent and emulator-safe.
