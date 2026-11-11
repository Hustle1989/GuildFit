"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  CalendarDays,
  CirclePlay,
  LayoutGrid,
  Menu,
  MessageCircle,
  Settings,
  Users,
  Wallet,
  X,
  type LucideIcon,
} from "lucide-react";
import { Logo } from "@/components/site/logo";
import { UserAvatar } from "@/components/shared";
import { ThemeToggle } from "@/components/theme";
import { SignOutButton } from "@/components/user-menu";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: LucideIcon; exact?: boolean };

const NAV: NavItem[] = [
  { href: "/trainer", label: "Overview", icon: LayoutGrid, exact: true },
  { href: "/trainer/programs", label: "Programs", icon: CirclePlay },
  { href: "/trainer/availability", label: "Slots & bookings", icon: CalendarDays },
  { href: "/trainer/clients", label: "Clients", icon: Users },
  { href: "/trainer/earnings", label: "Earnings", icon: Wallet },
  { href: "/trainer/messages", label: "Messages", icon: MessageCircle },
];

/** Trainer studio chrome: fixed sidebar on desktop, top bar + drawer on mobile. */
export function TrainerShell({
  user,
  publicHref,
  children,
}: {
  user: { name: string; image: string | null };
  publicHref: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));

  const link = (item: NavItem) => {
    const active = isActive(item.href, item.exact) || (item.href === "/trainer/availability" && pathname.startsWith("/trainer/sessions"));
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setOpen(false)}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex h-9 items-center gap-3 rounded-lg px-3 text-sm transition",
          active ? "bg-primary/12 font-medium text-foreground" : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground",
        )}
      >
        <item.icon className={cn("size-4", active && "text-primary")} />
        {item.label}
      </Link>
    );
  };

  const sidebar = (
    <div className="flex h-full flex-col p-4">
      <Logo href="/trainer" className="px-2 py-1" />

      <nav className="mt-7 space-y-0.5">{NAV.map(link)}</nav>

      <div className="my-4 border-t border-border" />

      <nav className="space-y-0.5">
        {link({ href: "/trainer/profile", label: "Edit profile", icon: Settings })}
        <Link
          href={publicHref}
          onClick={() => setOpen(false)}
          className="flex h-9 items-center gap-3 rounded-lg px-3 text-sm text-muted-foreground transition hover:bg-foreground/5 hover:text-foreground"
        >
          <ArrowUpRight className="size-4" /> View public profile
        </Link>
      </nav>

      <div className="mt-auto flex items-center gap-2 rounded-xl border border-border bg-card/60 p-2.5">
        <UserAvatar src={user.image} name={user.name} size={36} className="border border-border" />
        <div className="min-w-0 flex-1 pl-1">
          <p className="truncate text-sm font-medium">{user.name}</p>
          <p className="text-xs text-muted-foreground">Trainer</p>
        </div>
        <ThemeToggle className="size-8" />
        <SignOutButton
          label={false}
          className="grid size-8 shrink-0 place-items-center rounded-lg text-muted-foreground transition hover:bg-foreground/5 hover:text-destructive"
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:pl-60">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 border-r border-border bg-sidebar lg:block">{sidebar}</aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 border-r border-border bg-sidebar">{sidebar}</aside>
        </div>
      )}

      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl lg:hidden">
        <button className="grid size-9 place-items-center rounded-lg hover:bg-foreground/5" onClick={() => setOpen(true)} aria-label="Open menu">
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
        <Logo href="/trainer" />
        <ThemeToggle className="ml-auto" />
      </header>

      <main className="mx-auto max-w-[1180px] px-4 py-6 sm:px-8 lg:px-10 lg:py-9">{children}</main>
    </div>
  );
}
