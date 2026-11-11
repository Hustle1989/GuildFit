import type { NextRequest } from "next/server";
import { getAuth } from "@/lib/auth/server";

/**
 * Neon Auth middleware: refreshes the session cookie, completes the Google
 * OAuth hand-off on whatever page it lands on, and sends signed-out visitors
 * to /sign-in. Everything not listed in `publicRoutes` needs a session.
 * This is a convenience, not the security boundary: pages, actions and route
 * handlers check the session again on the server.
 */
const PUBLIC_ROUTES = [
  "/",
  "/trainers",
  "/programs",
  "/pricing",
  "/sign-up",
  "/sitemap.xml",
  "/robots.txt",
  // API routes that check the session themselves and answer 401 (not a redirect).
  "/api/trainer/live-bookings",
];

let middleware: ReturnType<ReturnType<typeof getAuth>["middleware"]> | undefined;

export function proxy(request: NextRequest) {
  middleware ??= getAuth().middleware({ loginUrl: "/sign-in", publicRoutes: PUBLIC_ROUTES });
  return middleware(request);
}

export const config = {
  // Everything except static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
