import type { Metadata } from "next";
import { CreditCard, Download, ShieldCheck } from "lucide-react";
import { PageHeader, Panel, StatusPill } from "@/components/app-ui";
import { getInvoices, getMembership } from "@/lib/mock-data";
import { formatDate, formatNaira } from "@/lib/utils";
import { MembershipCard } from "./membership-card";
import { UpdateCardButton } from "./update-card-button";

export const metadata: Metadata = { title: "Billing" };

export default function BillingPage() {
  const membership = getMembership();
  const invoices = getInvoices();

  return (
    <>
      <PageHeader title="Billing" subtitle="Your membership, payment method and receipts." />
      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <MembershipCard
          price={formatNaira(membership.priceKobo)}
          renewsLabel={formatDate(membership.renewsAt, "date")}
          sinceLabel={formatDate(membership.memberSince, "date")}
        />

        <div className="flex flex-col rounded-3xl border border-border bg-card p-6">
          <p className="font-bold">Payment method</p>
          <div className="mt-5 rounded-2xl bg-gradient-to-br from-zinc-700 to-zinc-900 p-5 text-white">
            <div className="flex items-center justify-between">
              <CreditCard className="size-6" />
              <span className="text-sm font-bold italic">{membership.card.brand}</span>
            </div>
            <p className="mt-8 font-mono tracking-[0.2em]">•••• •••• •••• {membership.card.last4}</p>
            <p className="mt-2 text-xs text-white/60">Expires {membership.card.expires}</p>
          </div>
          <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="size-3.5 text-primary" /> Securely stored by Paystack</p>
          <UpdateCardButton />
        </div>
      </div>

      <Panel title="Payment history" className="mt-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Description</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Amount</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-border/60 last:border-0">
                  <td className="whitespace-nowrap px-5 py-3.5 text-muted-foreground">{formatDate(inv.date, "date")}</td>
                  <td className="px-5 py-3.5">{inv.description}</td>
                  <td className="px-5 py-3.5"><StatusPill tone="green">{inv.status}</StatusPill></td>
                  <td className="px-5 py-3.5 text-right font-semibold tabular-nums">{formatNaira(inv.amountKobo)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <button className="text-muted-foreground hover:text-primary" aria-label="Download receipt"><Download className="size-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
