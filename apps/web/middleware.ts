import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { allow } from "@/lib/rateLimit";

const secret = process.env.NEXTAUTH_SECRET;
const protectedPaths = ["/dashboard/:path*"];

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const ip = req.headers.get("x-forwarded-for") ?? "127.0.0.1";

  // Rate limiting for auth-sensitive endpoints
  if (pathname.startsWith("/api/auth")) {
    if (!allow(ip, 20, 60000)) {
      return NextResponse.json(
        { ok: false, error: "rate_limited" },
        { status: 429 },
      );
    }
  }

  // Authentication for protected routes
  const isPathProtected = protectedPaths.some((path) => {
    const regex = new RegExp(`^${path.replace(/:\w+\*/g, ".*")}$`);
    return regex.test(pathname);
  });

  let response = NextResponse.next();

  if (isPathProtected) {
    const token = await getToken({ req, secret });
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      response = NextResponse.redirect(url);
    }
  }

  // Security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
