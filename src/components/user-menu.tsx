"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CreditCard, LayoutGrid, Loader2, LogOut, Settings } from "lucide-react";
import { UserAvatar } from "@/components/shared";
import { authClient } from "@/lib/auth/client";
import { cn } from "@/lib/utils";

export type HeaderUser = { name: string; email: string; image: string | null; role: "client" | "trainer" | null };

/** Signs out, then does a full page load so no signed-in state (or live query) survives. */
export function useSignOut() {
  const [pending, setPending] = useState(false);
  async function signOut() {
    setPending(true);
    await authClient.signOut();
    // A full page load on purpose: it drops every signed-in client state, including Realtime subscriptions.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign("/");
  }
  return { signOut, pending };
}

export function SignOutButton({ className, label = true }: { className?: string; label?: boolean }) {
  const { signOut, pending } = useSignOut();
  return (
    <button type="button" onClick={signOut} disabled={pending} aria-label="Sign out" title="Sign out" className={className}>
      {pending ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
      {label && "Sign out"}
    </button>
  );
}

export function UserMenu({ user }: { user: HeaderUser }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const item = "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition hover:bg-foreground/5";
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
        className="rounded-full ring-offset-2 ring-offset-background transition hover:ring-2 hover:ring-primary/40"
      >
        <UserAvatar src={user.image} name={user.name} size={34} className="border border-border" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-11 z-50 w-60 rounded-xl border border-border bg-popover p-1.5 shadow-xl">
          <div className="px-3 py-2">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <div className="my-1 border-t border-border" />
          {user.role === "trainer" && (
            <>
              <Link role="menuitem" href="/trainer" className={item} onClick={() => setOpen(false)}>
                <LayoutGrid className="size-4 text-muted-foreground" /> Trainer studio
              </Link>
              <Link role="menuitem" href="/trainer/profile" className={item} onClick={() => setOpen(false)}>
                <Settings className="size-4 text-muted-foreground" /> Edit profile
              </Link>
            </>
          )}
          {user.role === "client" && (
            <>
              <Link role="menuitem" href="/dashboard" className={item} onClick={() => setOpen(false)}>
                <LayoutGrid className="size-4 text-muted-foreground" /> My Library
              </Link>
              <Link role="menuitem" href="/billing" className={item} onClick={() => setOpen(false)}>
                <CreditCard className="size-4 text-muted-foreground" /> Billing
              </Link>
            </>
          )}
          {!user.role && (
            <Link role="menuitem" href="/onboarding" className={item} onClick={() => setOpen(false)}>
              <LayoutGrid className="size-4 text-muted-foreground" /> Finish setting up
            </Link>
          )}
          <div className="my-1 border-t border-border" />
          <SignOutButton className={cn(item, "text-destructive")} />
        </div>
      )}
    </div>
  );
}
