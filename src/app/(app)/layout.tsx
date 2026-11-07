import { SiteHeader } from "@/components/site/site-header";

/** Client area (My Library, sessions, messages, billing): same top bar as the public site. */
export default function ClientAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-16 pt-10 sm:px-6 sm:pt-14">{children}</main>
    </div>
  );
}
