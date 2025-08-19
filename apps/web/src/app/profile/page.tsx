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
