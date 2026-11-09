"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createRealtimeClient, type SealedLiveQuery } from "@neon/realtime/client";
import { drizzleParsers } from "@neon/realtime-drizzle/client";
import { RealtimeProvider, useLiveQuery } from "@neon/realtime-react";
import { toast } from "sonner";
import { InitialsAvatar, StatusPill } from "@/components/app-ui";
import { cn, formatDate, formatNaira, PLATFORM_FEE_PERCENT } from "@/lib/utils";

/** Same shape as `liveBookingsQuery` in lib/realtime.ts. */
export type LiveBookingRow = { id: string; paid_at: Date | null; amount_kobo: number; duration_min: number; name: string };

type Props = { userId: string; initialData: LiveBookingRow[]; sealedQuery: SealedLiveQuery<LiveBookingRow> };

/** Trainer dashboard feed of paid bookings, kept live by Neon Realtime. */
export function LiveBookings(props: Props) {
  // One client per mounted page; it only connects in the browser.
  const [client] = useState(() =>
    createRealtimeClient({ url: process.env.NEXT_PUBLIC_NEON_REALTIME_URL!, parsers: { ...drizzleParsers } }),
  );
  return (
    <RealtimeProvider client={client}>
      <Feed {...props} />
    </RealtimeProvider>
  );
}

// A full page load resets this.
let signedOut = false;

function Feed({ userId, initialData, sealedQuery }: Props) {
  const [query] = useState(sealedQuery); // renewals go through refreshQuery
  const refreshQuery = useCallback(async () => {
    if (signedOut) throw new Error("Signed out");
    const res = await fetch("/api/trainer/live-bookings", { method: "POST", body: JSON.stringify({ userId }) });
    if (res.status === 401) {
      signedOut = true; // the hook retries every second, so stop calling the server
      window.location.reload();
      throw new Error("Signed out");
    }
    if (!res.ok) throw new Error(`Could not renew the live query (${res.status})`);
    return (await res.json()) as SealedLiveQuery<LiveBookingRow>;
  }, [userId]);

  const { data, status } = useLiveQuery(query, { refreshQuery, initialData });
  // Live rows don't keep ORDER BY, so sort here.
  const rows = [...(data ?? initialData)].sort((a, b) => time(b.paid_at) - time(a.paid_at));

  // Rows that weren't in the server render arrived live: highlight and announce them.
  const [initialIds] = useState(() => new Set(initialData.map((r) => r.id)));
  const fresh = new Set(rows.filter((r) => !initialIds.has(r.id)).map((r) => r.id));
  const announced = useRef(new Set<string>());
  useEffect(() => {
    for (const r of rows) {
      if (initialIds.has(r.id) || announced.current.has(r.id)) continue;
      announced.current.add(r.id);
      toast.success(`New booking from ${r.name} · +${formatNaira(net(r.amount_kobo))}`);
    }
  });

  return (
    <section className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex items-center justify-between px-5 pb-3 pt-5">
        <h2 className="font-semibold">Live bookings</h2>
        {status === "live" ? (
          <StatusPill tone="green" dot>
            Live
          </StatusPill>
        ) : status === "connecting" ? (
          <StatusPill tone="muted">Connecting…</StatusPill>
        ) : (
          <StatusPill tone="amber">Offline</StatusPill>
        )}
      </div>
      {rows.length === 0 ? (
        <p className="border-t border-border/60 px-5 py-10 text-center text-sm text-muted-foreground">
          No paid bookings yet. They appear here the moment a client pays.
        </p>
      ) : (
        <ul className="divide-y divide-border/60 border-t border-border/60">
          {rows.map((r) => (
            <li key={r.id} className={cn("flex items-center gap-3 px-5 py-3 transition-colors duration-1000", fresh.has(r.id) && "bg-primary/8")}>
              <InitialsAvatar name={r.name} size={34} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">
                  <span className="font-semibold">{r.name}</span> <span className="text-muted-foreground">booked a {r.duration_min}-min session</span>
                </p>
                <p className="text-xs text-muted-foreground">{fresh.has(r.id) ? "Just now" : r.paid_at ? formatDate(r.paid_at, "stamp") : ""}</p>
              </div>
              <p className="text-sm font-semibold tabular-nums text-primary">+{formatNaira(net(r.amount_kobo))}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

const time = (d: Date | string | null) => (d ? new Date(d).getTime() : 0);
const net = (grossKobo: number) => Math.round(grossKobo * (1 - PLATFORM_FEE_PERCENT / 100));
