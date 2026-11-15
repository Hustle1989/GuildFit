/**
 * Keeps the demo trainers bookable: fills the next two weeks (Lagos time)
 * with open 1:1 slots wherever a demo trainer has nothing scheduled yet.
 *
 *   npm run db:slots
 *
 * Non-destructive: it never deletes or changes existing slots, bookings or
 * anything else, and only touches the seeded @guildfit.test trainers, so it
 * is safe to run any time the booking pages start to look empty.
 */
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { and, asc, eq, gt, like } from "drizzle-orm";
import { Pool } from "pg";
import * as schema from "../src/db/schema";
import { pgConnectionString } from "../src/db/url";
import { openSlotPlan, overlaps } from "./slot-plan";

config({ path: ".env.local" });
if (!process.env.DATABASE_URL) throw new Error("Run `neon env pull` first: DATABASE_URL is required.");

const { profiles, trainerProfiles, slots } = schema;
const pool = new Pool({ connectionString: pgConnectionString(process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL) });
const db = drizzle(pool, { schema });

async function main() {
  const now = Date.now();
  const trainers = await db
    .select({ id: trainerProfiles.userId, slug: trainerProfiles.slug, name: profiles.name, priceKobo: trainerProfiles.sessionPriceKobo })
    .from(trainerProfiles)
    .innerJoin(profiles, eq(profiles.id, trainerProfiles.userId))
    .where(like(profiles.email, "%@guildfit.test"))
    .orderBy(asc(profiles.name));
  if (trainers.length === 0) throw new Error("No demo trainers found. Run `npm run db:seed` first.");

  let total = 0;
  for (const t of trainers) {
    const existing = await db
      .select({ startsAt: slots.startsAt, durationMin: slots.durationMin })
      .from(slots)
      .where(and(eq(slots.trainerId, t.id), gt(slots.startsAt, new Date(now - 24 * 3_600_000))));
    const fresh = openSlotPlan(t.slug, t.priceKobo, now).filter((p) => !existing.some((e) => overlaps(e, p)));
    if (fresh.length > 0) await db.insert(slots).values(fresh.map((p) => ({ trainerId: t.id, ...p })));
    total += fresh.length;
    console.log(`✓ ${t.name.padEnd(14)} +${fresh.length} open slots`);
  }
  console.log(`\nAdded ${total} slots over the next two weeks.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
