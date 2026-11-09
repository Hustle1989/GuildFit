import "server-only";
import { and, eq, like, ne, or } from "drizzle-orm";
import { db, programs, trainerProfiles } from "@/db";
import { slugify } from "@/lib/utils";

type Table = "trainer" | "program";

/** A URL slug that no other trainer (or program) uses yet: "amara-okafor", "amara-okafor-2"… */
export async function uniqueSlug(text: string, table: Table, exceptId?: string) {
  const base = slugify(text);
  const column = table === "trainer" ? trainerProfiles.slug : programs.slug;
  const idColumn = table === "trainer" ? trainerProfiles.userId : programs.id;
  const taken = new Set(
    (
      await db
        .select({ slug: column })
        .from(table === "trainer" ? trainerProfiles : programs)
        .where(and(or(eq(column, base), like(column, `${base}-%`)), exceptId ? ne(idColumn, exceptId) : undefined))
    ).map((r) => r.slug),
  );
  if (!taken.has(base)) return base;
  for (let n = 2; ; n++) if (!taken.has(`${base}-${n}`)) return `${base}-${n}`;
}
