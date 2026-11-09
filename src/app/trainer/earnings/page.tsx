import type { Metadata } from "next";
import { Banknote, Percent, Wallet } from "lucide-react";
import { PageHeader, Panel, StatTile } from "@/components/app-ui";
import { EarningsChart } from "@/components/earnings-chart";
import { UserAvatar } from "@/components/shared";
import { getEarningsTotals, getLedger, getWeeklyEarnings } from "@/lib/queries";
import { requireTrainer } from "@/lib/session";
import { formatDate, formatNaira, PLATFORM_FEE_PERCENT } from "@/lib/utils";

export const metadata: Metadata = { title: "Earnings" };

export default async function EarningsPage() {
  const user = await requireTrainer();
  const [ledger, totals, weekly] = await Promise.all([getLedger(user.id), getEarningsTotals(user.id, 30), getWeeklyEarnings(user.id)]);

  return (
    <>
      <PageHeader title="Earnings" subtitle={`From 1:1 sessions, after GuildFit's ${PLATFORM_FEE_PERCENT}% platform fee. Payouts are coming soon.`} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatTile label="Net (yours)" value={formatNaira(totals.net)} icon={Wallet} delta="Last 30 days" highlight />
        <StatTile label="Gross sales" value={formatNaira(totals.gross)} icon={Banknote} delta={`${totals.count} paid sessions · 30 days`} />
        <StatTile label="Platform fees" value={formatNaira(totals.fee)} icon={Percent} delta={`${PLATFORM_FEE_PERCENT}% per session`} />
      </div>

      <Panel title="Net earnings per week" className="mt-5">
        <div className="p-5">
          <EarningsChart data={weekly.map((w) => ({ label: formatDate(w.weekStart, "short"), netKobo: w.netKobo }))} />
        </div>
      </Panel>

      <Panel title="Ledger" className="mt-5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="px-5 py-3 text-right font-medium">Gross</th>
                <th className="px-5 py-3 text-right font-medium">Fee</th>
                <th className="px-5 py-3 text-right font-medium">Net</th>
              </tr>
            </thead>
            <tbody>
              {ledger.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">No paid sessions yet.</td>
                </tr>
              )}
              {ledger.map((row) => {
                const client = { name: row.clientName, image: row.clientAvatar };
                return (
                  <tr key={row.id} className="border-b border-border/60 last:border-0">
                    <td className="whitespace-nowrap px-5 py-3.5 text-muted-foreground">{formatDate(row.date, "date")}</td>
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-2.5"><UserAvatar src={client.image} name={client.name} size={28} /> {client.name}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums">{formatNaira(row.grossKobo)}</td>
                    <td className="px-5 py-3.5 text-right tabular-nums text-muted-foreground">−{formatNaira(row.feeKobo)}</td>
                    <td className="px-5 py-3.5 text-right font-semibold tabular-nums text-primary">{formatNaira(row.netKobo)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
