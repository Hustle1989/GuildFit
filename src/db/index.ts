import "server-only";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// GuildFit runs as a long-lived Node server (Cloudways), so a regular pg Pool
// over Neon's pooled connection string is the simplest fit and supports
// transactions. One pool per process; reused across dev hot reloads.
const globalForDb = globalThis as unknown as { pgPool?: Pool };

function createPool() {
  return new Pool({ connectionString: process.env.DATABASE_URL, max: 10 });
}

const pool = globalForDb.pgPool ?? createPool();
if (process.env.NODE_ENV !== "production") globalForDb.pgPool = pool;

export const db = drizzle(pool, { schema });
export * from "./schema";
