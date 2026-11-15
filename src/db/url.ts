/**
 * Neon connection strings ask for `sslmode=require`. pg already treats that as
 * full certificate verification (`verify-full`) but prints a security warning
 * because a future major version will weaken it. Asking for `verify-full`
 * outright keeps today's protection and silences the warning. Done in code,
 * not in .env.local, so `neon env pull` can't undo it.
 */
export function pgConnectionString(url: string | undefined): string {
  if (!url) throw new Error("Missing environment variable: DATABASE_URL (run `neon env pull`)");
  return url.replace(/([?&]sslmode=)(?:prefer|require|verify-ca)(?=&|$)/, "$1verify-full");
}
