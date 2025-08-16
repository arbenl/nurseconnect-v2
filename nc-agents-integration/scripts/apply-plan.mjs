#!/usr/bin/env node
/**
 * apply-plan.mjs
 * Applies a plan JSON produced by agent-runner.mjs / Gemini CLI.
 * Accepts either { "ops": [...] } or { "actions": [...] } shapes.
 *
 * Supported op types:
 *  - write   : { type, path, content }
 *  - append  : { type, path, content }
 *  - delete  : { type, path }
 *
 * Flags:
 *  --dry-run : don’t write, only print what would happen
 */

import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// Determine the repository root. This script lives at: <repo>/nc-agents-integration/scripts/apply-plan.mjs
// so the repo root is two directories up. Allow override via --repo-root or REPO_ROOT env var.
const defaultRepoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const repoRootFlagIndex = process.argv.findIndex((a) => a === "--repo-root");
const repoRootFromFlag = repoRootFlagIndex !== -1 ? process.argv[repoRootFlagIndex + 1] : null;
const repoRoot = path.resolve(process.env.REPO_ROOT || repoRootFromFlag || defaultRepoRoot);


const [, , planPath, ...rest] = process.argv;
if (!planPath) {
  console.error("Usage: node scripts/apply-plan.mjs <PLAN.json> [--dry-run] [--repo-root <path>]");
  process.exit(1);
}
const dryRun = rest.includes("--dry-run");

function log(step, ...args) {
  console.log(step, ...args);
}

function resolveTarget(rel) {
  // Always resolve relative paths against the repo root (not the nc-agents-integration folder)
  return path.resolve(repoRoot, rel);
}

async function ensureDirFor(filePath) {
  const dir = path.dirname(filePath);
  await fsp.mkdir(dir, { recursive: true });
}

async function writeFileSafe(filePath, content) {
  await ensureDirFor(filePath);
  await fsp.writeFile(filePath, content, "utf8");
}

async function appendFileSafe(filePath, content) {
  await ensureDirFor(filePath);
  await fsp.appendFile(filePath, content, "utf8");
}

function maybeRewritePathForMonorepo(p) {
  // If a plan writes `.env.local` at repo root, but we have apps/web,
  // prefer placing it under apps/web/.env.local (your current layout).
  if (p === ".env.local") {
    const monorepoEnv = path.join("apps", "web", ".env.local");
    if (fs.existsSync(path.join(repoRoot, "apps", "web"))) {
      return monorepoEnv;
    }
  }
  return p;
}

async function main() {
  let raw;
  try {
    raw = await fsp.readFile(planPath, "utf8");
  } catch (e) {
    console.error(`Could not read plan: ${planPath}`);
    console.error(e.message);
    process.exit(1);
  }

  let json;
  try {
    json = JSON.parse(raw);
  } catch (e) {
    console.error("Plan is not valid JSON. Aborting.");
    process.exit(1);
  }

  // Accept either "ops" or "actions"
  const ops = Array.isArray(json.ops) ? json.ops : Array.isArray(json.actions) ? json.actions : null;
  if (!ops) {
    console.error("Plan JSON missing 'ops' or 'actions' array.");
    process.exit(1);
  }

  log(`📦 Applying plan from ${planPath}${dryRun ? " (dry-run)" : ""}`);

  for (const [i, op] of ops.entries()) {
    const kind = (op.type || "").toLowerCase();
    if (!kind) {
      log(`  • [${i}] Skipped: missing 'type'`);
      continue;
    }

    let targetRel = op.path;
    if (!targetRel && (kind === "write" || kind === "append" || kind === "delete")) {
      log(`  • [${i}] Skipped: '${kind}' missing 'path'`);
      continue;
    }

    // Monorepo-friendly rewrite for .env.local at root
    targetRel = maybeRewritePathForMonorepo(targetRel);
    const targetAbs = resolveTarget(targetRel);

    if (kind === "write") {
      const content = op.content ?? "";
      log(`  • [${i}] WRITE ${targetRel}`);
      if (!dryRun) {
        await writeFileSafe(targetAbs, content);
      }
    } else if (kind === "append") {
      const content = op.content ?? "";
      log(`  • [${i}] APPEND ${targetRel}`);
      if (!dryRun) {
        await appendFileSafe(targetAbs, content);
      }
    } else if (kind === "delete") {
      log(`  • [${i}] DELETE ${targetRel}`);
      if (!dryRun) {
        if (fs.existsSync(targetAbs)) {
          await fsp.rm(targetAbs, { recursive: true, force: true });
        }
      }
    } else {
      log(`  • [${i}] Skipped: unsupported op type '${op.type}'`);
    }
  }

  // Optional: run verify commands if present and not dry-run
  const verify = Array.isArray(json.verify) ? json.verify : [];
  if (!dryRun && verify.length) {
    log("🧪 Running verify commands:");
    for (const [i, cmd] of verify.entries()) {
      log(`  • [${i}] ${cmd}`);
      // We only print them; executing arbitrary commands automatically can be dangerous.
      // If you want auto-exec, you can spawn here intentionally.
    }
  }

  log("✅ Plan application complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});