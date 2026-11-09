import { HeaderForSession } from "@/components/site/header-for-session";
import { requireClient } from "@/lib/session";

/** Client area (My Library, sessions, messages, billing): signed-in clients only, same top bar as the public site. */
export default async function ClientAppLayout({ children }: { children: React.ReactNode }) {
  await requireClient();
  return (
    <div className="flex min-h-screen flex-col">
      <HeaderForSession />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 pt-10 sm:px-6 sm:pt-14">{children}</main>
    </div>
  );
}
