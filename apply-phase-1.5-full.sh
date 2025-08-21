#!/usr/bin/env bash
set -euo pipefail

echo "==> Phase 1.5 full apply (DEV/UX/SECURITY/PERF/QA)"

ROOT="$(pwd)"

# 0) Ensure we're at repo root (has package.json)
test -f "${ROOT}/package.json" || { echo "Run from repo root"; exit 1; }

# 1) Shared Role type
mkdir -p apps/web/src/types
cat > apps/web/src/types/role.ts <<'TS'
export type Role = "patient" | "nurse" | "admin";

export const ROLES: Role[] = ["patient", "nurse", "admin"];

export function isRole(v: unknown): v is Role {
  return typeof v === "string" && (ROLES as string[]).includes(v);
}
TS

# 2) Profile API route (replace with secured/validated version)
mkdir -p apps/web/src/app/api/profile
cat > apps/web/src/app/api/profile/route.ts <<'TS'
import { NextResponse, NextRequest } from "next/server"
import { getServerSession } from "next-auth"
// import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/lib/firebase/admin"
import { z } from "zod"
import { isRole, type Role } from "@/types/role"

// --- minimal structured logging ---
function log(ev: Record<string, unknown>) {
  try {
    // Keep it tiny and JSON—OPS-friendly
    console.log(JSON.stringify({ ts: Date.now(), src: "api/profile", ...ev }))
  } catch {}
}

// --- BEST-EFFORT tiny rate-limit (per-process, for dev) ---
const rl = new Map<string, number[]>()
const LIMIT = 10 // 10 requests
const INTERVAL_MS = 30_000 // per 30s
function allowKey(key: string) {
  const now = Date.now()
  const arr = rl.get(key) ?? []
  const recent = arr.filter((t) => now - t < INTERVAL_MS)
  recent.push(now)
  rl.set(key, recent)
  return recent.length <= LIMIT
}

// -- utils
function deny(status = 401, message = "Unauthorized") {
  log({ event: "deny", status, message })
  return NextResponse.json({ error: message }, { status })
}

function getUidFromSession(session: any): string | null {
  const uid = session?.user?.id ?? (session as any)?.user?.sub ?? null
  return typeof uid === "string" ? uid : null
}

function getRoleFromSession(session: any): Role | undefined {
  const role = session?.user?.role
  if (isRole(role)) return role
  return undefined
}

// -- Zod schema for PUT
const PutBody = z.object({
  displayName: z.string().trim().max(120).optional(),
  role: z.enum(["patient", "nurse", "admin"]).optional(),
})

export async function GET(req: NextRequest) {
  // rate-limit by ip
  const ip = req.headers.get("x-forwarded-for") ?? "local"
  if (!allowKey(`GET:${ip}`)) return deny(429, "Too Many Requests")

  // const session = await getServerSession(authOptions)
  const session = await getServerSession()
  if (!session) return deny()
  const uid = getUidFromSession(session)
  if (!uid) return deny(403, "No user id on session")

  const snap = await db.collection("users").doc(uid).get()
  if (!snap.exists) {
    const shell = { id: uid, role: "patient" as Role, displayName: session.user?.name ?? "" }
    log({ event: "profile_get_default", uid })
    return NextResponse.json(shell, { status: 200 })
  }
  const data = snap.data() || {}
  log({ event: "profile_get_ok", uid })
  return NextResponse.json({ id: uid, ...data }, { status: 200 })
}

export async function PUT(req: NextRequest) {
  // rate-limit by ip
  const ip = req.headers.get("x-forwarded-for") ?? "local"
  if (!allowKey(`PUT:${ip}`)) return deny(429, "Too Many Requests")

  // const session = await getServerSession(authOptions)
  const session = await getServerSession()
  if (!session) return deny()
  const uid = getUidFromSession(session)
  if (!uid) return deny(403, "No user id on session")

  const json = await req.json().catch(() => ({}))
  const parsed = PutBody.safeParse(json)
  if (!parsed.success) {
    log({ event: "profile_put_bad_body", uid, issues: parsed.error.issues })
    return NextResponse.json({ error: "Invalid body", issues: parsed.error.issues }, { status: 400 })
  }

  const update: Record<string, unknown> = {}
  if (typeof parsed.data.displayName === "string") {
    update.displayName = parsed.data.displayName
  }

  if (typeof parsed.data.role === "string") {
    const nextRole = parsed.data.role as Role
    if (!isRole(nextRole)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }
    // Non-admins cannot self-elevate to admin
    const currentRole = getRoleFromSession(session)
    if (nextRole === "admin" && currentRole !== "admin") {
      return deny(403, "Only admins can set admin role")
    }
    update.role = nextRole
  }

  if (Object.keys(update).length === 0) {
    log({ event: "profile_put_noop", uid })
    return NextResponse.json({ ok: true, noop: true }, { status: 200 })
  }

  await db.collection("users").doc(uid).set(update, { merge: true })
  // PERF: no second read
  log({ event: "profile_put_ok", uid, update })
  return NextResponse.json({ id: uid, ...update }, { status: 200 })
}
TS

# 3) Unit tests for Profile API (mocked, no emulators)
mkdir -p apps/web/src/app/api/profile/__tests__
cat > apps/web/src/app/api/profile/__tests__/route.test.ts <<'TS'
import { describe, it, expect, vi, beforeEach } from "vitest"
import { GET, PUT } from "../route"
import type { NextRequest } from "next/server"

// --- Mocks ---
vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}))

// Mock Firestore admin db
const setMock = vi.fn()
const getMock = vi.fn()
const docMock = vi.fn(() => ({ set: setMock, get: getMock }))
const collectionMock = vi.fn(() => ({ doc: docMock }))

vi.mock("@/lib/firebase/admin", () => ({
  db: {
    collection: collectionMock,
  },
}))

function makeReq(url: string, method: "GET" | "PUT", body?: any): NextRequest {
  const u = new URL(url)
  const headers = new Headers()
  // simulate client ip for limiter
  headers.set("x-forwarded-for", "127.0.0.1")
  return {
    method,
    url: u.toString(),
    headers,
    json: async () => body,
  } as unknown as NextRequest
}

const { getServerSession } = await import("next-auth")

describe("Profile API", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("GET denies when not authenticated", async () => {
    ;(getServerSession as any).mockResolvedValue(null)
    const res: any = await GET(makeReq("http://localhost/api/profile", "GET"))
    expect(res.status).toBe(401)
  })

  it("GET returns default shell when no doc", async () => {
    ;(getServerSession as any).mockResolvedValue({ user: { id: "u1", name: "Jane" } })
    getMock.mockResolvedValueOnce({ exists: false })
    const res: any = await GET(makeReq("http://localhost/api/profile", "GET"))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toMatchObject({ id: "u1", role: "patient", displayName: "Jane" })
    expect(collectionMock).toHaveBeenCalledWith("users")
  })

  it("PUT prevents self-elevation to admin", async () => {
    ;(getServerSession as any).mockResolvedValue({ user: { id: "u1", role: "patient" } })
    const res: any = await PUT(
      makeReq("http://localhost/api/profile", "PUT", { role: "admin" })
    )
    expect(res.status).toBe(403)
  })

  it("PUT accepts patient->nurse", async () => {
    ;(getServerSession as any).mockResolvedValue({ user: { id: "u1", role: "patient" } })
    const res: any = await PUT(
      makeReq("http://localhost/api/profile", "PUT", { role: "nurse", displayName: "J" })
    )
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toMatchObject({ id: "u1", role: "nurse", displayName: "J" })
    expect(setMock).toHaveBeenCalledWith({ role: "nurse", displayName: "J" }, { merge: true })
  })
})
TS

# 4) Suggested Firestore rules (write to a side file for review)
cat > firestore.rules.phase15.suggested <<'RULES'
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow update, create:
        if request.auth != null
        && request.auth.uid == userId
        && (
          !('role' in request.resource.data)
          || request.resource.data.role in ['patient','nurse']
          || (request.resource.data.role == 'admin' && (request.auth.token.role == 'admin'))
        );
      allow delete: if false; // or mirror update condition if you support self-delete
    }
  }
}
RULES

# 5) Install deps (zod) in web
echo "==> Installing zod in apps/web"
pnpm -F web add zod >/dev/null

# 6) Format (optional if you have prettier)
if command -v pnpm >/dev/null 2>&1; then
  pnpm -w -s exec bash -lc 'git ls-files "*.ts" "*.tsx" | xargs -r npx --yes prettier@3.3.3 -w' || true
fi

# 7) Commit
git add apps/web/src/types/role.ts \
        apps/web/src/app/api/profile/route.ts \
        apps/web/src/app/api/profile/__tests__/route.test.ts \
        firestore.rules.phase15.suggested

git commit -m "phase1.5+: Zod validation, logging, rate-limit, PERF fix, API unit tests, suggested Firestore rules"

echo "✅ Phase 1.5+ applied & committed."
echo "➡️  Review firestore.rules.phase15.suggested and merge into firestore.rules when ready."