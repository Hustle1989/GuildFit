"use client";

import { useState, useTransition } from "react";
import { CalendarClock, Crown, Loader2, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { StatusPill } from "@/components/app-ui";
import { Button } from "@/components/ui/button";
import { cancelMembership, resumeMembership } from "@/lib/actions";

export function MembershipCard({
  status,
  price,
  renewsLabel,
  sinceLabel,
}: {
  status: "active" | "non_renewing";
  price: string;
  renewsLabel: string;
  sinceLabel: string;
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  const cancel = () =>
    startTransition(async () => {
      await cancelMembership();
      setConfirming(false);
      toast.success("Subscription cancelled. Access continues until the end of your month.");
    });
  const resume = () =>
    startTransition(async () => {
      await resumeMembership();
      toast.success("Welcome back! Your membership will renew.");
    });

  return (
    <div className="glow relative overflow-hidden rounded-3xl border border-primary/30 bg-card p-6 sm:p-8">
      <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-primary/20 blur-3xl" />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Crown className="size-6" />
          </span>
          <div>
            <p className="text-xl font-bold">GuildFit Monthly</p>
            <p className="text-sm text-muted-foreground">Member since {sinceLabel}</p>
          </div>
        </div>
        {status === "active" ? <StatusPill tone="green">Active</StatusPill> : <StatusPill tone="amber">Cancelled · ends {renewsLabel}</StatusPill>}
      </div>

      <div className="relative mt-8 flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-4xl font-bold tracking-tight">
            {price}
            <span className="text-base font-medium text-muted-foreground"> / month</span>
          </p>
          <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarClock className="size-4 text-primary" />
            {status === "active" ? `Renews on ${renewsLabel}` : `Full access until ${renewsLabel}`}
          </p>
        </div>
        {status === "active" ? (
          !confirming ? (
            <Button variant="outline" onClick={() => setConfirming(true)}>
              Cancel subscription
            </Button>
          ) : (
            <div className="w-full rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 sm:w-auto">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <TriangleAlert className="size-4 text-amber-600 dark:text-amber-300" /> Cancel your membership?
              </p>
              <p className="mt-1 text-xs text-muted-foreground">You keep access until {renewsLabel}. No refunds for the current month.</p>
              <div className="mt-3 flex gap-2">
                <Button variant="destructive" size="sm" onClick={cancel} disabled={pending}>
                  {pending && <Loader2 className="animate-spin" />} Yes, cancel
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirming(false)} disabled={pending}>
                  Keep membership
                </Button>
              </div>
            </div>
          )
        ) : (
          <Button onClick={resume} disabled={pending}>
            {pending && <Loader2 className="animate-spin" />} Resume membership
          </Button>
        )}
      </div>
    </div>
  );
}
