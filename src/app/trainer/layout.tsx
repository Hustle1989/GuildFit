import Link from "next/link";
import { requireTrainer } from "@/lib/session";

const NAV = [
  { href: "/trainer", label: "Overview" },
  { href: "/trainer/programs", label: "Programs" },
  { href: "/trainer/availability", label: "Availability" },
  { href: "/trainer/clients", label: "Clients" },
  { href: "/trainer/earnings", label: "Earnings" },
  { href: "/trainer/profile", label: "Profile" },
];

export default async function TrainerLayout({ children }: LayoutProps<"/trainer">) {
  await requireTrainer();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <nav className="mb-8 flex gap-1 overflow-x-auto border-b pb-px">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="whitespace-nowrap rounded-t-lg px-4 py-2 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          >
            {item.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
