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
