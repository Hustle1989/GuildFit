import { SiteHeader } from "@/components/site/site-header";
import { getCurrentUser } from "@/lib/session";

/** Server wrapper: reads the session once and hands the header what it needs. */
export async function HeaderForSession() {
  const user = await getCurrentUser();
  return <SiteHeader user={user && { name: user.name, email: user.email, image: user.image, role: user.role }} />;
}
