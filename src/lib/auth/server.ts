import "server-only";
import { createNeonAuth } from "@neondatabase/auth/next/server";
import { env } from "@/lib/env";

type NeonAuth = ReturnType<typeof createNeonAuth>;
let instance: NeonAuth | undefined;

/** Created lazily so `next build` doesn't need auth secrets. */
export function getAuth(): NeonAuth {
  instance ??= createNeonAuth({
    baseUrl: env("NEON_AUTH_BASE_URL"),
    cookies: { secret: env("NEON_AUTH_COOKIE_SECRET") },
  });
  return instance;
}
