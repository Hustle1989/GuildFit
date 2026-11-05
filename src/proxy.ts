import type { NextRequest } from "next/server";
import { getAuth } from "@/lib/auth/server";

// Redirects signed-out visitors and refreshes the session cookie.
// This is a convenience, not the security boundary: every page, action and
// route handler checks the session again on the server.
export function proxy(request: NextRequest) {
  return getAuth().middleware({ loginUrl: "/sign-in" })(request);
}

export const config = {
  matcher: [
    "/onboarding",
    "/dashboard/:path*",
    "/trainer/:path*",
    "/messages/:path*",
    "/sessions/:path*",
    "/billing/:path*",
  ],
};
