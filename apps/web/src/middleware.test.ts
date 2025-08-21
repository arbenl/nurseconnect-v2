/**
 * Middleware tests
 * - Does NOT hit real NextAuth.
 * - Mocks `getToken` so we can simulate unauthenticated/authenticated states.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "./middleware";

// Ensure env so NextAuth doesn't error when imported anywhere
process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "test-secret";
process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

// Mock next-auth/jwt to control auth state inside middleware
vi.mock("next-auth/jwt", () => {
  return {
    getToken: vi.fn(),
  };
});

const { getToken } = await import("next-auth/jwt");

describe("Middleware", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should redirect unauthenticated users from /dashboard to /login with callbackUrl", async () => {
    (getToken as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const req = new NextRequest("http://localhost:3000/dashboard");
    const res = await middleware(req);

    expect(res?.status).toBe(307);
    const location = new URL(res!.headers.get("location")!);
    expect(location.pathname).toBe("/login");
    // NextAuth may set callbackUrl as a path-only value ("/dashboard") or an encoded absolute URL,
    // depending on NEXTAUTH_URL and version. Accept either to avoid false negatives.
    const callback = location.searchParams.get("callbackUrl");
    const absoluteEncoded = encodeURIComponent(
      "http://localhost:3000/dashboard",
    );
    expect(callback === "/dashboard" || callback === absoluteEncoded).toBe(
      true,
    );
  });

  it("should allow authenticated users to access /dashboard (no redirect)", async () => {
    (getToken as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      email: "user@example.com",
      sub: "user-123",
    });

    const req = new NextRequest("http://localhost:3000/dashboard");
    const res = await middleware(req);

    // When allowed, our middleware returns undefined (let it pass through)
    expect(res).toBeUndefined();
  });

  it("should allow anyone to access the home page /", async () => {
    (getToken as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(null);

    const req = new NextRequest("http://localhost:3000/");
    const res = await middleware(req);

    expect(res).toBeUndefined();
  });
});
