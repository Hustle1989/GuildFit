"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { InitialsAvatar, StatusPill } from "@/components/app-ui";
import { cn, formatDate, formatNaira } from "@/lib/utils";

export type FeedRow = { id: string; name: string; paidAt: string; durationMin: number; netKobo: number };

/**
 * UI-only stand-in for the Neon Realtime feed: shows paid bookings and fakes a
 * new one arriving a few seconds after load so the "live" state is visible.
 */
export function LiveBookings({ rows, incoming }: { rows: FeedRow[]; incoming: FeedRow }) {
  const [feed, setFeed] = useState(rows);
  const [fresh, setFresh] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setFeed((f) => [incoming, ...f]);
      setFresh(incoming.id);
      toast.success(`New booking from ${incoming.name} · +${formatNaira(incoming.netKobo)}`);
    }, 6000);
    return () => clearTimeout(t);
  }, [incoming]);

  return (
    <section className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between px-5 pb-3 pt-5">
        <h2 className="font-semibold">Live bookings</h2>
        <StatusPill tone="green" dot>
          Live
        </StatusPill>
      </div>
      <ul className="divide-y divide-border/60 border-t border-border/60">
        {feed.slice(0, 6).map((r) => (
          <li
            key={r.id}
            className={cn("flex items-center gap-3 px-5 py-3 transition-colors duration-1000", fresh === r.id && "bg-primary/8")}
          >
            <InitialsAvatar name={r.name} size={34} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">
                <span className="font-semibold">{r.name}</span> <span className="text-muted-foreground">booked a 1:1 session</span>
              </p>
              <p className="text-xs text-muted-foreground">{fresh === r.id ? "Just now" : formatDate(r.paidAt, "stamp")}</p>
            </div>
            <p className="text-sm font-semibold tabular-nums text-primary">+{formatNaira(r.netKobo)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
