"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Logo } from "@/components/site/logo";
import { ThemeToggle } from "@/components/theme";
import { SignOutButton, UserMenu, type HeaderUser } from "@/components/user-menu";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; also?: string[] };

function navFor(user: HeaderUser | null): NavItem[] {
  const common = [
    { href: "/trainers", label: "Trainers" },
    { href: "/programs", label: "Programs" },
  ];
  if (user?.role === "client")
    return [...common, { href: "/dashboard", label: "My Library", also: ["/sessions", "/billing"] }, { href: "/messages", label: "Messages" }];
  if (user?.role === "trainer") return [...common, { href: "/trainer", label: "Trainer Dashboard" }];
  return [...common, { href: "/pricing", label: "Pricing" }];
}

export function SiteHeader({ user }: { user: HeaderUser | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const nav = navFor(user);
  const isActive = (item: NavItem) =>
    [item.href, ...(item.also ?? [])].some((href) => pathname === href || pathname.startsWith(`${href}/`));

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-10 px-4 sm:px-6">
        <Logo />

        <nav className="hidden items-center gap-7 text-sm md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn("text-muted-foreground transition hover:text-foreground", isActive(item) && "text-foreground")}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <ThemeToggle />
          {user ? (
            <div className="ml-1.5 hidden sm:block">
              <UserMenu user={user} />
            </div>
          ) : (
            <>
              <Link href="/sign-in" className="hidden px-3 text-sm font-medium transition hover:text-primary sm:block">
                Log in
              </Link>
              <Link href="/sign-up" className={buttonVariants({ className: "glow hidden h-9 px-4 font-semibold sm:inline-flex" })}>
                Join now
              </Link>
            </>
          )}
          <button
            className={buttonVariants({ variant: "ghost", size: "icon", className: "size-9 md:hidden" })}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border/70 px-4 pb-6 pt-2 md:hidden">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn("block py-3 text-lg font-medium", isActive(item) ? "text-primary" : "text-foreground")}
            >
              {item.label}
            </Link>
          ))}
          {user ? (
            <div className="mt-4 flex items-center justify-between rounded-xl border border-border p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
              <SignOutButton className={buttonVariants({ variant: "outline", className: "h-9" })} />
            </div>
          ) : (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Link href="/sign-in" className={buttonVariants({ variant: "outline", className: "h-11" })}>
                Log in
              </Link>
              <Link href="/sign-up" className={buttonVariants({ className: "h-11 font-semibold" })}>
                Join now
              </Link>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
