import { getCurrentUser } from "@/lib/session";
import { uploadAuthParams } from "@/lib/imagekit";

// Signed upload params for the browser. Signed-in users only.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  return Response.json(uploadAuthParams(), { headers: { "Cache-Control": "no-store" } });
}
