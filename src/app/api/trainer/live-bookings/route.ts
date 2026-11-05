import { getCurrentUser } from "@/lib/session";
import { sealTrainerBookings } from "@/lib/realtime";

// Renews the sealed live query before it expires. A Route Handler (not a
// server action) so renewals never queue behind other actions.
export async function POST() {
  const noStore = { "Cache-Control": "private, no-store" };
  const user = await getCurrentUser();
  if (!user || user.role !== "trainer") {
    return Response.json({ error: "UNAUTHENTICATED" }, { status: 401, headers: noStore });
  }
  return Response.json(await sealTrainerBookings(user.id), { headers: noStore });
}
