import "server-only";
import { createNeonAuth } from "@neon/auth/next/server";

type NeonAuth = ReturnType<typeof createNeonAuth>;
let instance: NeonAuth | undefined;

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name} (run \`neon env pull\` or see README)`);
  return value;
}

/**
 * Neon Auth (Managed Better Auth) server instance: session reads, server-side
 * sign-in/up, the /api/auth proxy handler and the route-protection middleware.
 * Created lazily so `next build` can import pages without auth secrets.
 */
export function getAuth(): NeonAuth {
  instance ??= createNeonAuth({
    baseUrl: required("NEON_AUTH_BASE_URL"),
    cookies: { secret: required("NEON_AUTH_COOKIE_SECRET") },
  });
  return instance;
}
