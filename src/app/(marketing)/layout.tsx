import { SiteFooter } from "@/components/site/site-footer";
import { HeaderForSession } from "@/components/site/header-for-session";

export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen flex-col">
      <HeaderForSession />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
