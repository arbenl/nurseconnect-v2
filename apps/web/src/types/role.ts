export type Role = "patient" | "nurse" | "admin";

export const ROLES: Role[] = ["patient", "nurse", "admin"];

export function isRole(v: unknown): v is Role {
  return typeof v === "string" && (ROLES as string[]).includes(v);
}
