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
