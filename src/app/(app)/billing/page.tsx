import type { Metadata } from "next";
import { Crown, CreditCard, Download, ShieldCheck } from "lucide-react";
import { PageHeader, Panel, StatusPill } from "@/components/app-ui";
import { CheckoutButton } from "@/components/demo-checkout-button";
import { subscribeMembership } from "@/lib/actions";
import { getMembership, isMembershipActive, listPayments } from "@/lib/queries";
import { requireClient } from "@/lib/session";
import { formatDate, formatNaira, MEMBERSHIP_PRICE_KOBO } from "@/lib/utils";
import { MembershipCard } from "./membership-card";
import { UpdateCardButton } from "./update-card-button";

export const metadata: Metadata = { title: "Billing" };

export default async function BillingPage() {
  const user = await requireClient();
  const [membership, invoices] = await Promise.all([getMembership(user.id), listPayments(user.id)]);
  const member = isMembershipActive(membership);

  return (
    <>
      <PageHeader title="Billing" subtitle="Your membership, payment method and receipts." />
      <div className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        {member && membership ? (
          <MembershipCard
            status={membership.status === "active" ? "active" : "non_renewing"}
            price={formatNaira(MEMBERSHIP_PRICE_KOBO)}
            renewsLabel={formatDate(membership.currentPeriodEnd, "date")}
            sinceLabel={formatDate(membership.createdAt, "date")}
          />
        ) : (
          <div className="flex flex-col justify-between gap-6 rounded-3xl border border-border bg-card p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-xl bg-primary/15 text-primary">
                <Crown className="size-6" />
              </span>
              <div>
                <p className="text-xl font-bold">{membership ? "Your membership ended" : "You are not a member yet"}</p>
                <p className="text-sm text-muted-foreground">
                  {membership ? `Access ended ${formatDate(membership.currentPeriodEnd, "date")}.` : "Unlock every lesson in every program."}
                </p>
              </div>
            </div>
            <CheckoutButton action={subscribeMembership} className="glow h-12 w-full text-base font-semibold sm:w-auto sm:px-8">
              {membership ? "Rejoin" : "Subscribe"} · {formatNaira(MEMBERSHIP_PRICE_KOBO)}/month
            </CheckoutButton>
          </div>
        )}

        <div className="flex flex-col rounded-3xl border border-border bg-card p-6">
          <p className="font-bold">Payment method</p>
          <div className="mt-5 rounded-2xl bg-gradient-to-br from-zinc-700 to-zinc-900 p-5 text-white">
            <div className="flex items-center justify-between">
              <CreditCard className="size-6" />
              <span className="text-sm font-bold italic">Paystack</span>
            </div>
            <p className="mt-8 font-mono tracking-[0.2em]">•••• •••• •••• ••••</p>
            <p className="mt-2 text-xs text-white/60">Test mode: no card on file yet</p>
          </div>
          <p className="mt-4 flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="size-3.5 text-primary" /> Cards are stored by Paystack, never by GuildFit</p>
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
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">No payments yet.</td>
                </tr>
              )}
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-border/60 last:border-0">
                  <td className="whitespace-nowrap px-5 py-3.5 text-muted-foreground">{formatDate(inv.date, "date")}</td>
                  <td className="px-5 py-3.5">{inv.description}</td>
                  <td className="px-5 py-3.5"><StatusPill tone="green">Paid</StatusPill></td>
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
