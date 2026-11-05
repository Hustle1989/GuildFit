"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { SealedLiveQuery } from "@neon/realtime/client";
import { createRealtimeClient } from "@neon/realtime/client";
import { drizzleParsers } from "@neon/realtime-drizzle/client";
import { RealtimeProvider, useLiveQuery } from "@neon/realtime-react";
import { CalendarCheck, Radio } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { LocalTime } from "@/components/local-time";
import { formatNaira } from "@/lib/utils";

export type BookingRow = {
  id: string;
  paid_at: Date | null;
  starts_at: Date;
  duration_min: number;
  name: string;
  gross_kobo: number;
  net_kobo: number;
};

/**
 * Trainer dashboard feed. With Neon Realtime configured, new paid bookings
 * appear instantly; otherwise it falls back to refreshing every 15 seconds.
 */
export function LiveBookings({
  url,
  sealedQuery,
  initialRows,
}: {
  url: string | null;
  sealedQuery: SealedLiveQuery<BookingRow> | null;
  initialRows: BookingRow[];
}) {
  if (!url || !sealedQuery) return <PollingFeed rows={initialRows} />;
  return (
    <RealtimeRoot url={url}>
      <LiveFeed sealedQuery={sealedQuery} initialRows={initialRows} />
    </RealtimeRoot>
  );
}

function RealtimeRoot({ url, children }: { url: string; children: React.ReactNode }) {
  // Creating the client doesn't connect; it connects on the first subscription.
  const [client] = useState(() => createRealtimeClient({ url, parsers: { ...drizzleParsers } }));
  return <RealtimeProvider client={client}>{children}</RealtimeProvider>;
}

function LiveFeed({ sealedQuery, initialRows }: { sealedQuery: SealedLiveQuery<BookingRow>; initialRows: BookingRow[] }) {
  const [query] = useState(sealedQuery); // keep the first one; renewals go through refreshQuery
  const refreshQuery = useCallback(async () => {
    const res = await fetch("/api/trainer/live-bookings", { method: "POST", cache: "no-store" });
    if (!res.ok) throw new Error("Could not renew live query");
    return (await res.json()) as SealedLiveQuery<BookingRow>;
  }, []);
  const { data, status } = useLiveQuery(query, { initialData: initialRows, refreshQuery });
  return <Feed rows={data ?? initialRows} live={status === "live"} />;
}

function PollingFeed({ rows }: { rows: BookingRow[] }) {
  const router = useRouter();
  useEffect(() => {
    const timer = setInterval(() => router.refresh(), 15_000);
    return () => clearInterval(timer);
  }, [router]);
  return <Feed rows={rows} live={false} />;
}

function Feed({ rows, live }: { rows: readonly BookingRow[]; live: boolean }) {
  const sorted = [...rows].sort((a, b) => +new Date(b.paid_at ?? 0) - +new Date(a.paid_at ?? 0));
  const net = rows.reduce((sum, r) => sum + r.net_kobo, 0);
  const gross = rows.reduce((sum, r) => sum + r.gross_kobo, 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Net earnings" value={formatNaira(net)} highlight />
        <Stat label="Gross sales" value={formatNaira(gross)} />
        <Stat label="Paid sessions" value={String(rows.length)} />
      </div>

      <div className="rounded-2xl border bg-card">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h2 className="font-semibold">Recent bookings</h2>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Radio className={live ? "size-3.5 animate-pulse text-primary" : "size-3.5"} />
            {live ? "Live" : "Auto-refresh"}
          </span>
        </div>
        {sorted.length === 0 ? (
          <div className="p-5">
            <EmptyState icon={CalendarCheck} title="No bookings yet" description="Add availability so clients can book you." />
          </div>
        ) : (
          <ul className="divide-y">
            {sorted.slice(0, 10).map((r) => (
              <li key={r.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <div>
                  <p className="font-medium">{r.name}</p>
                  <p className="text-muted-foreground">
                    <LocalTime date={r.starts_at} /> · {r.duration_min} min
                  </p>
                </div>
                <span className="font-semibold text-primary">+{formatNaira(r.net_kobo)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={highlight ? "mt-1 text-3xl font-black text-primary" : "mt-1 text-3xl font-black"}>{value}</p>
    </div>
  );
}
