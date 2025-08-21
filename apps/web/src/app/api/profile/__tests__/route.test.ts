import { vi, describe, it, expect, beforeEach } from "vitest";

// --- Mocks ---
const setMock = vi.fn();
const getMock = vi.fn();
const docMock = vi.fn(() => ({ set: setMock, get: getMock }));
const collectionMock = vi.fn(() => ({ doc: docMock }));

vi.mock('@/lib/firebase/db-admin', () => ({
  db: {
    collection: collectionMock,
  },
}));

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));
// --- End Mocks ---

import type { NextRequest } from "next/server";

function makeReq(url: string, method: "GET" | "PUT", body?: any): NextRequest {
  const u = new URL(url);
  const headers = new Headers();
  headers.set("x-forwarded-for", "127.0.0.1");
  return {
    method,
    url: u.toString(),
    headers,
    json: async () => body,
  } as unknown as NextRequest;
}

const { getServerSession } = await import("next-auth");

describe("Profile API", () => {
  let GET: any;
  let PUT: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    ({ GET, PUT } = await import("../route"));
  });

  it("GET denies when not authenticated", async () => {
    (getServerSession as any).mockResolvedValue(null);
    const res: any = await GET(makeReq("http://localhost/api/profile", "GET"));
    expect(res.status).toBe(401);
  });

  it("GET returns default shell when no doc", async () => {
    (getServerSession as any).mockResolvedValue({ user: { id: "u1", name: "Jane" } });
    getMock.mockResolvedValueOnce({ exists: false });
    const res: any = await GET(makeReq("http://localhost/api/profile", "GET"));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({ id: "u1", role: "patient", displayName: "Jane" });
    expect(collectionMock).toHaveBeenCalledWith("users");
  });

  it("PUT prevents self-elevation to admin", async () => {
    (getServerSession as any).mockResolvedValue({ user: { id: "u1", role: "patient" } });
    const res: any = await PUT(
      makeReq("http://localhost/api/profile", "PUT", { role: "admin" })
    );
    expect(res.status).toBe(403);
  });

  it("PUT accepts patient->nurse", async () => {
    (getServerSession as any).mockResolvedValue({ user: { id: "u1", role: "patient" } });
    const res: any = await PUT(
      makeReq("http://localhost/api/profile", "PUT", { role: "nurse", displayName: "J" })
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toMatchObject({ id: "u1", role: "nurse", displayName: "J" });
    expect(setMock).toHaveBeenCalledWith({ role: "nurse", displayName: "J" }, { merge: true });
  });
});