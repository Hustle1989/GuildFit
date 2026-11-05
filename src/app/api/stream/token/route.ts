import { getCurrentUser } from "@/lib/session";
import { createUserToken } from "@/lib/stream";

// The Stream chat and video clients call this from their tokenProvider.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json({ token: createUserToken(user.id) }, { headers: { "Cache-Control": "no-store" } });
}
