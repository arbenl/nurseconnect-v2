# create-and-commit-phase-1.5.sh
set -euo pipefail


# 1) API route
mkdir -p apps/web/src/app/api/profile
cat > apps/web/src/app/api/profile/route.ts <<'TS'
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
// If your auth route exports authOptions, you can import and pass to getServerSession
// import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/lib/firebase/admin"

type Role = "patient" | "nurse" | "admin"

function deny(status = 401, message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status })
}

function getUidFromSession(session: any): string | null {
  // Prefer id on session.user, fallback to sub if present
  const uid = session?.user?.id ?? (session as any)?.user?.sub ?? null
  return typeof uid === "string" ? uid : null
}

function getRoleFromSession(session: any): Role | undefined {
  const role = session?.user?.role
  if (role === "patient" || role === "nurse" || role === "admin") return role
  return undefined
}

export async function GET() {
  // const session = await getServerSession(authOptions)
  const session = await getServerSession()
  if (!session) return deny()
  const uid = getUidFromSession(session)
  if (!uid) return deny(403, "No user id on session")

  const snap = await db.collection("users").doc(uid).get()
  if (!snap.exists) {
    // Return a sensible default shell so the client can render a form immediately
    return NextResponse.json(
      { id: uid, role: "patient", displayName: session.user?.name ?? "" },
      { status: 200 }
    )
  }
  const data = snap.data() || {}
  return NextResponse.json({ id: uid, ...data }, { status: 200 })
}

export async function PUT(req: Request) {
  // const session = await getServerSession(authOptions)
  const session = await getServerSession()
  if (!session) return deny()
  const uid = getUidFromSession(session)
  if (!uid) return deny(403, "No user id on session")

  const body = await req.json().catch(() => ({}))
  const update: Record<string, unknown> = {}

  // Validate displayName (optional)
  if (typeof body.displayName === "string") {
    update.displayName = body.displayName.trim().slice(0, 120)
  }

  // Validate role change
  if (typeof body.role === "string") {
    const nextRole = body.role as Role
    if (!["patient", "nurse", "admin"].includes(nextRole)) {
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
    return NextResponse.json({ ok: true, noop: true }, { status: 200 })
  }

  await db.collection("users").doc(uid).set(update, { merge: true })
  const saved = await db.collection("users").doc(uid).get()
  return NextResponse.json({ id: uid, ...saved.data() }, { status: 200 })
}
TS

# 2) /profile page
mkdir -p apps/web/src/app/profile
cat > apps/web/src/app/profile/page.tsx <<'TSX'
"use client"
import { useEffect, useState, useTransition } from "react"

type Role = "patient" | "nurse" | "admin"
type Profile = { id: string; displayName?: string; role?: Role }

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    fetch("/api/profile")
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((data) => {
        if (mounted) setProfile(data)
      })
      .catch(async (r) => {
        const msg = typeof r?.json === "function" ? (await r.json())?.error : "Failed to load profile"
        if (mounted) setError(String(msg ?? "Failed to load profile"))
      })
    return () => {
      mounted = false
    }
  }, [])

  const onSave = () =>
    startTransition(() => {
      setError(null)
      setOk(null)
      fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: profile?.displayName, role: profile?.role }),
      })
        .then((r) => (r.ok ? r.json() : Promise.reject(r)))
        .then((data) => {
          setProfile(data)
          setOk("Profile saved")
        })
        .catch(async (r) => {
          const msg = typeof r?.json === "function" ? (await r.json())?.error : "Failed to save"
          setError(String(msg ?? "Failed to save"))
        })
    })

  if (!profile) {
    return <div className="p-6 text-sm opacity-80">Loading profile…</div>
  }

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Your Profile</h1>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {ok && <p className="text-sm text-green-600">{ok}</p>}

      <div className="grid gap-4">
        <label className="grid gap-1">
          <span className="text-sm">Display Name</span>
          <input
            className="border rounded p-2"
            value={profile.displayName ?? ""}
            onChange={(e) => setProfile((p) => ({ ...(p as Profile), displayName: e.target.value }))}
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm">Role</span>
          <select
            className="border rounded p-2"
            value={profile.role ?? "patient"}
            onChange={(e) => setProfile((p) => ({ ...(p as Profile), role: e.target.value as Role }))}
          >
            <option value="patient">Patient</option>
            <option value="nurse">Nurse</option>
            <option value="admin">Admin</option>
          </select>
          <p className="text-xs opacity-70">
            Only admins can promote to <strong>admin</strong>. Others may switch between <strong>patient</strong> and{" "}
            <strong>nurse</strong>.
          </p>
        </label>

        <button
          disabled={pending}
          onClick={onSave}
          className="inline-flex items-center gap-2 rounded px-4 py-2 bg-black text-white disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save"}
        </button>
      </div>
    </main>
  )
}
TSX

# 3) /dashboard page
mkdir -p apps/web/src/app/dashboard
cat > apps/web/src/app/dashboard/page.tsx <<'TSX'
import { getServerSession } from "next-auth"
// import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "@/lib/firebase/admin"
import RoleBadge from "@/components/role-badge"

type Role = "patient" | "nurse" | "admin"

async function getRole(uid: string): Promise<Role> {
  const snap = await db.collection("users").doc(uid).get()
  const role = (snap.data()?.role as Role) ?? "patient"
  return role
}

function getUidFromSession(session: any): string | null {
  const uid = session?.user?.id ?? (session as any)?.user?.sub ?? null
  return typeof uid === "string" ? uid : null
}

export default async function DashboardPage() {
  // const session = await getServerSession(authOptions)
  const session = await getServerSession()
  if (!session) {
    // In production you might redirect to /login in middleware already
    return <div className="p-6">Please sign in to view the dashboard.</div>
  }
  const uid = getUidFromSession(session)
  if (!uid) return <div className="p-6">No user id on session.</div>

  const role = await getRole(uid)

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <RoleBadge role={role} />
      </header>

      {role === "admin" && (
        <section className="border rounded p-4">
          <h2 className="font-medium mb-2">Admin</h2>
          <ul className="list-disc ml-5 text-sm">
            <li>Manage users</li>
            <li>System insights</li>
          </ul>
        </section>
      )}

      {role === "nurse" && (
        <section className="border rounded p-4">
          <h2 className="font-medium mb-2">Nurse</h2>
          <ul className="list-disc ml-5 text-sm">
            <li>Assigned patients</li>
            <li>Shift overview</li>
          </ul>
        </section>
      )}

      {role === "patient" && (
        <section className="border rounded p-4">
          <h2 className="font-medium mb-2">Patient</h2>
          <ul className="list-disc ml-5 text-sm">
            <li>My care plan</li>
            <li>Appointments</li>
          </ul>
        </section>
      )}
    </main>
  )
}
TSX

# 4) RoleBadge + test
mkdir -p apps/web/src/components/__tests__
cat > apps/web/src/components/role-badge.tsx <<'TSX'
type Role = "patient" | "nurse" | "admin"

export default function RoleBadge({ role }: { role: Role }) {
  const label = role === "admin" ? "Admin" : role === "nurse" ? "Nurse" : "Patient"
  return (
    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs">
      {label}
    </span>
  )
}
TSX

cat > apps/web/src/components/__tests__/role-badge.test.tsx <<'TSX'
import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import RoleBadge from "../role-badge"

describe("RoleBadge", () => {
  it("renders Patient", () => {
    render(<RoleBadge role="patient" />)
    expect(screen.getByText("Patient")).toBeInTheDocument()
  })
})
TSX

git add apps/web/src/app/api/profile/route.ts \
        apps/web/src/app/profile/page.tsx \
        apps/web/src/app/dashboard/page.tsx \
        apps/web/src/components/role-badge.tsx \
        apps/web/src/components/__tests__/role-badge.test.tsx

git commit -m "phase1.5: Profile API + Profile page, role-aware Dashboard, RoleBadge + test"
echo "✅ Committed on branch $BRANCH"