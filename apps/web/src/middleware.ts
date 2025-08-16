import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/signin" }, // adjust to your route
});

export const config = {
  matcher: ["/dashboard/:path*"],
};