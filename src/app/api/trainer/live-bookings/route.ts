import { getRealtime, liveBookingsQuery } from "@/lib/realtime";
import { getCurrentUser } from "@/lib/session";

/**
 * Renews the trainer's sealed live-bookings query. The user comes from the
 * session cookie; the body's `userId` must match it, so a page left open after
 * someone else signs in on this browser stops renewing instead of leaking rows.
 */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  const body = (await request.json().catch(() => ({}))) as { userId?: unknown };
  if (!user || user.role !== "trainer" || body.userId !== user.id) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const sealedQuery = await getRealtime().seal({ query: liveBookingsQuery(user.id) });
  return Response.json(sealedQuery, { headers: { "Cache-Control": "no-store" } });
}
