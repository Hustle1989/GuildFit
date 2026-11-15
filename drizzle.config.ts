import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
import { pgConnectionString } from "./src/db/url";

config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  // Migrations use the direct (non-pooled) connection; the app uses the pooled one.
  dbCredentials: { url: pgConnectionString(process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL) },
  // Only manage our own schema; Neon Auth owns `neon_auth`.
  schemaFilter: ["public"],
});
