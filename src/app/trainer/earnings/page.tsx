import { desc, eq, sum } from "drizzle-orm";
import { Wallet } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { LocalTime } from "@/components/local-time";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { bookings, db, earnings, profiles } from "@/db";
import { requireTrainer } from "@/lib/session";
import { formatNaira, PLATFORM_FEE_PERCENT } from "@/lib/utils";

export default async function EarningsPage() {
  const user = await requireTrainer();
  const [rows, [totals]] = await Promise.all([
    db
      .select({
        id: earnings.id,
        createdAt: earnings.createdAt,
        grossKobo: earnings.grossKobo,
        feeKobo: earnings.feeKobo,
        netKobo: earnings.netKobo,
        clientName: profiles.name,
      })
      .from(earnings)
      .innerJoin(bookings, eq(bookings.id, earnings.bookingId))
      .innerJoin(profiles, eq(profiles.id, bookings.clientId))
      .where(eq(earnings.trainerId, user.id))
      .orderBy(desc(earnings.createdAt)),
    db
      .select({ gross: sum(earnings.grossKobo).mapWith(Number), fee: sum(earnings.feeKobo).mapWith(Number), net: sum(earnings.netKobo).mapWith(Number) })
      .from(earnings)
      .where(eq(earnings.trainerId, user.id)),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Earnings</h1>
        <p className="text-muted-foreground">
          From 1:1 sessions, after GuildFit&apos;s {PLATFORM_FEE_PERCENT}% platform fee. Payouts are coming soon.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Total label="Net (yours)" kobo={totals?.net ?? 0} highlight />
        <Total label="Gross" kobo={totals?.gross ?? 0} />
        <Total label="Platform fees" kobo={totals?.fee ?? 0} />
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={Wallet} title="No earnings yet" description="Earnings appear here when a client pays for a session." />
      ) : (
        <div className="rounded-2xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead className="text-right">Gross</TableHead>
                <TableHead className="text-right">Fee</TableHead>
                <TableHead className="text-right">Net</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell><LocalTime date={r.createdAt} mode="date" /></TableCell>
                  <TableCell>{r.clientName}</TableCell>
                  <TableCell className="text-right">{formatNaira(r.grossKobo)}</TableCell>
                  <TableCell className="text-right text-muted-foreground">−{formatNaira(r.feeKobo)}</TableCell>
                  <TableCell className="text-right font-semibold text-primary">{formatNaira(r.netKobo)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function Total({ label, kobo, highlight }: { label: string; kobo: number; highlight?: boolean }) {
  return (
    <div className="rounded-2xl border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className={highlight ? "mt-1 text-3xl font-black text-primary" : "mt-1 text-3xl font-black"}>{formatNaira(kobo)}</p>
    </div>
  );
}
