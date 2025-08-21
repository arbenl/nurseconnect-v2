import React from 'react';

type Role = "patient" | "nurse" | "admin";

export default function RoleBadge({ role }: { role: Role }) {
  const label =
    role === "admin" ? "Admin" : role === "nurse" ? "Nurse" : "Patient";
  return (
    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs">
      {label}
    </span>
  );
}
