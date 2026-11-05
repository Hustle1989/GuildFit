import "server-only";
import { createRealtime } from "@neon/realtime/server";
import { drizzleAdapter } from "@neon/realtime-drizzle";
import { desc, eq } from "drizzle-orm";
import { bookings, db, earnings, profiles, slots } from "@/db";
import { env } from "@/lib/env";

function create() {
  return createRealtime({
    secret: env("NEON_REALTIME_SECRET"),
    db: process.env.NEON_REALTIME_DB ?? "neondb",
    adapter: drizzleAdapter(),
    debugMode: process.env.NODE_ENV === "development",
  });
}
let realtime: ReturnType<typeof create> | undefined;
const getRealtime = () => (realtime ??= create());

export const isRealtimeConfigured = () =>
  Boolean(process.env.NEON_REALTIME_SECRET && process.env.NEXT_PUBLIC_NEON_REALTIME_URL);

/**
 * Paid bookings for one trainer. Must be a deterministic SELECT (no now()).
 * Selected keys match column names so Realtime decodes rows correctly.
 */
function trainerBookingsQuery(trainerId: string) {
  return db
    .select({
      id: bookings.id,
      paid_at: bookings.paidAt,
      starts_at: slots.startsAt,
      duration_min: slots.durationMin,
      name: profiles.name,
      gross_kobo: earnings.grossKobo,
      net_kobo: earnings.netKobo,
    })
    .from(bookings)
    .innerJoin(slots, eq(slots.id, bookings.slotId))
    .innerJoin(profiles, eq(profiles.id, bookings.clientId))
    .innerJoin(earnings, eq(earnings.bookingId, bookings.id))
    .where(eq(bookings.trainerId, trainerId))
    .orderBy(desc(bookings.paidAt))
    .limit(50);
}

export type TrainerBookingRow = Awaited<ReturnType<typeof trainerBookingsQuery>>[number];

/** Run the query and seal it together, so SSR rows and the live query match. */
export async function loadTrainerBookings(trainerId: string) {
  const query = trainerBookingsQuery(trainerId);
  if (!isRealtimeConfigured()) return { rows: await query, sealedQuery: null };
  const [rows, sealedQuery] = await Promise.all([query, getRealtime().seal({ query })]);
  return { rows, sealedQuery };
}

export const sealTrainerBookings = (trainerId: string) =>
  getRealtime().seal({ query: trainerBookingsQuery(trainerId) });
