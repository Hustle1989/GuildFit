import "server-only";
import { createRealtime } from "@neon/realtime/server";
import { drizzleAdapter } from "@neon/realtime-drizzle";
import { and, desc, eq } from "drizzle-orm";
import { bookings, db, profiles, slots } from "@/db";

type Realtime = ReturnType<typeof createRealtime>;
let instance: Realtime | undefined;

/** Neon Realtime server: seals live queries so browsers can subscribe to them. */
export function getRealtime(): Realtime {
  if (!instance) {
    const secret = process.env.NEON_REALTIME_SECRET;
    if (!secret) throw new Error("Missing environment variable: NEON_REALTIME_SECRET (run `neon env pull`)");
    const dbName = new URL(process.env.DATABASE_URL!).pathname.slice(1) || "neondb";
    instance = createRealtime({ secret, db: dbName, adapter: drizzleAdapter() });
  }
  return instance;
}

/**
 * A trainer's latest paid bookings. Deterministic (no now()), authorized by
 * the trainer id from the session, and every selected key matches its column
 * name, as the Realtime Drizzle adapter requires.
 */
export function liveBookingsQuery(trainerId: string) {
  return db
    .select({
      id: bookings.id,
      paid_at: bookings.paidAt,
      amount_kobo: bookings.amountKobo,
      duration_min: slots.durationMin,
      name: profiles.name,
    })
    .from(bookings)
    .innerJoin(slots, eq(slots.id, bookings.slotId))
    .innerJoin(profiles, eq(profiles.id, bookings.clientId))
    .where(and(eq(bookings.trainerId, trainerId), eq(bookings.status, "paid")))
    .orderBy(desc(bookings.paidAt))
    .limit(6);
}

export type LiveBookingRow = Awaited<ReturnType<typeof liveBookingsQuery>>[number];

/** Initial rows for the server render plus the sealed query the browser subscribes to. */
export async function loadLiveBookings(trainerId: string) {
  const query = liveBookingsQuery(trainerId);
  const [initialData, sealedQuery] = await Promise.all([query, getRealtime().seal({ query })]);
  return { initialData, sealedQuery };
}
