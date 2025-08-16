#!/usr/bin/env node
/**
 * Usage:
 *   node scripts/agent-runner.mjs <agent> <task>
 * Example:
 *   node scripts/agent-runner.mjs dev 1-auth-roles
 *
 * Agents: dev | qa | security | ops
 * Prompts expected at: nc-agents-integration/prompts/{context_*.md, <task>.md}
 * Output to: nc-agents-integration/output/<task>/<AGENT>.plan.json
 */

import { readFileSync, mkdirSync, writeFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { spawnSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// workspace root is parent of this scripts folder
const root = join(__dirname, "..");

const AGENT = process.argv[2];
const TASK = process.argv[3];

if (!AGENT || !TASK) {
  console.error("Usage: node scripts/agent-runner.mjs <agent> <task>");
  process.exit(1);
}

const AGENT_MAP = {
  dev: "context_dev.md",
  qa: "context_qa.md",
  security: "context_security.md",
  ops: "context_devops.md",
};

if (!AGENT_MAP[AGENT]) {
  console.error(`Unknown agent: ${AGENT}. Use one of: dev | qa | security | ops`);
  process.exit(1);
}

const promptsDir = join(root, "prompts");
const contextFile = join(promptsDir, AGENT_MAP[AGENT]);
const taskFile = join(promptsDir, `${TASK}.md`);

if (!existsSync(contextFile)) {
  console.error(`Missing context file: ${contextFile}`);
  process.exit(1);
}
if (!existsSync(taskFile)) {
  console.error(`Missing task file: ${taskFile}`);
  process.exit(1);
}

const context = readFileSync(contextFile, "utf8");
const task = readFileSync(taskFile, "utf8");

// Strongly instruct JSON output (no markdown fences)
const jsonEnvelope = `
You are generating a single JSON object (no markdown fences, no commentary).
The schema is:

{
  "agent": "${AGENT.toUpperCase()}",
  "task": "${TASK}",
  "summary": "one-sentence high-level summary",
  "actions": [
    {
      "type": "write" | "append" | "replace",
      "path": "<relative path from repo root>",
      "description": "what/why concisely",
      "content": "if type=write/replace: full contents of the file; if append: the block to append"
    }
  ],
  "verify": [
    "shell command(s) to verify (one per string)",
    "..."
  ],
  "notes": [
    "any caveats or follow-ups"
  ]
}

Rules:
- Output MUST be valid JSON only (UTF-8), no extra text or markdown.
- No code fences.
- Keep file paths accurate relative to the repository root.
- Prefer minimal edits: only source/config files, never caches or node_modules.
- If unknowns exist, propose sensible defaults and mention them in notes.
`;

const fullPrompt = `${context}

---
TASK DETAILS:
${task}

---
OUTPUT FORMAT REQUIREMENT:
${jsonEnvelope}
`;

const outDir = join(root, "output", TASK);
mkdirSync(outDir, { recursive: true });
const outFile = join(outDir, `${AGENT.toUpperCase()}.plan.json`);
const rawFile = join(outDir, `${AGENT.toUpperCase()}.raw.txt`);

const model = process.env.GEMINI_MODEL; // optional override via env

console.log(`▶️  Generating plan for agent=${AGENT} task=${TASK}`);

function runOnce() {
  const args = [
    "-y",
    "@google/gemini-cli@latest",
    "-p",
    fullPrompt,
    "--debug=false"
  ];
  if (model) {
    args.push("--model", model);
  }

  return spawnSync("npx", args, {
    encoding: "utf8",
    cwd: root,
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 120_000
  });
}

function normalizeToJson(stdout) {
  if (!stdout) return null;
  let s = stdout.trim();

  // Remove common markdown fences and keep inner content
  s = s.replace(/```json\s*([\s\S]*?)\s*```/gi, "$1");
  s = s.replace(/```([\s\S]*?)```/g, "$1");

  // Remove common preface lines that some CLIs print
  // e.g., "Loaded cached credentials." or similar noise
  // We'll just locate the first opening brace and the last closing brace
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;

  s = s.slice(start, end + 1).trim();

  try {
    JSON.parse(s); // validate
    return s;
  } catch {
    return null;
  }
}

// Attempt 1
let cli = runOnce();
let normalized = normalizeToJson(cli.stdout);

if (!normalized) {
  // Persist raw for debugging
  try {
    writeFileSync(
      rawFile,
      (cli.stdout || "") + "\n--- STDERR ---\n" + (cli.stderr || ""),
      "utf8"
    );
  } catch {}

  console.warn("First attempt produced non-JSON or noisy output. Retrying once...");

  // Attempt 2
  cli = runOnce();
  normalized = normalizeToJson(cli.stdout);
}

if (!normalized) {
  console.error("Gemini returned non-JSON after retry. Raw output saved at:", rawFile);
  console.error("Trimmed stdout (first 2000 chars):\n");
  console.error((cli.stdout || "").slice(0, 2000));
  process.exit(cli.status || 2);
}

writeFileSync(outFile, normalized, "utf8");
console.log(`✅ Plan written: ${outFile}`);