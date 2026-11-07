import type { Metadata } from "next";
import { Check, ChevronDown, Minus, ShieldCheck } from "lucide-react";
import { DemoCheckoutButton } from "@/components/demo-checkout-button";
import { formatNaira, MEMBERSHIP_PRICE_KOBO } from "@/lib/utils";
import { publishedPrograms, trainers } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Membership pricing",
  description: "One GuildFit membership unlocks every workout program from every trainer.",
};

const PERKS = [
  `All ${publishedPrograms.length} programs from ${trainers.length} coaches`,
  "New programs as soon as they're published",
  "Track progress lesson by lesson",
  "Message any coach, anytime",
  "Cancel anytime: access lasts to the end of your month",
];

const COMPARISON: [string, boolean | string, boolean | string][] = [
  ["Browse trainers & programs", true, true],
  ["First lesson of every program", true, true],
  ["Message coaches", true, true],
  ["Book paid 1:1 video sessions", true, true],
  ["Every lesson in every program", false, true],
  ["Progress tracking", false, true],
  ["Member-only programs & early access", false, true],
];

const FAQ = [
  ["Do I need a membership to book a 1:1 session?", "No. Sessions are paid per booking directly to GuildFit through Paystack, membership or not."],
  ["How do I cancel?", "Cancel from Billing in one click. You keep full access until the end of the month you've paid for."],
  ["Which payment methods are supported?", "Cards, bank transfer and USSD through Paystack. Prices are in Naira."],
  ["Can I switch coaches?", "Yes. Your membership covers every program from every coach on GuildFit."],
];

export default function PricingPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 size-[640px] -translate-x-1/2 rounded-full bg-primary/10 blur-[150px]" />

      <section className="relative mx-auto max-w-6xl px-4 pb-16 pt-16 text-center sm:px-6 sm:pt-24">
        <p className="eyebrow">Membership</p>
        <h1 className="font-display mx-auto mt-4 max-w-4xl text-5xl text-balance sm:text-7xl">
          One membership. <span className="whitespace-nowrap text-primary">Every program.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
          Unlimited access to every program on GuildFit. 1:1 video sessions are booked separately with each coach.
        </p>
      </section>

      <section className="relative mx-auto grid max-w-5xl gap-6 px-4 sm:px-6 md:grid-cols-[1fr_1.1fr]">
        <div className="glow rounded-3xl border border-primary/40 bg-card p-8">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold uppercase tracking-wider text-primary">GuildFit Monthly</p>
            <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">Most popular</span>
          </div>
          <p className="mt-4 text-6xl font-bold tracking-tight">
            {formatNaira(MEMBERSHIP_PRICE_KOBO)}
          </p>
          <p className="text-muted-foreground">per month · billed monthly</p>
          <DemoCheckoutButton href="/payments/callback?type=membership" className="glow mt-8 h-12 w-full text-base font-semibold">
            Subscribe with Paystack
          </DemoCheckoutButton>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" /> Secure checkout · Cancel anytime
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card/60 p-8">
          <h2 className="text-lg font-bold">Everything you get</h2>
          <ul className="mt-6 space-y-4">
            {PERKS.map((perk) => (
              <li key={perk} className="flex gap-3">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                  <Check className="size-3.5" />
                </span>
                {perk}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="relative mx-auto max-w-4xl px-4 py-20 sm:px-6">
        <h2 className="font-display text-center text-3xl sm:text-4xl">Free vs. member</h2>
        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-4 font-medium text-muted-foreground">Feature</th>
                <th className="w-28 p-4 text-center font-semibold">Free</th>
                <th className="w-28 p-4 text-center font-semibold text-primary">Member</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map(([feature, free, member]) => (
                <tr key={feature} className="border-b border-border/60 last:border-0">
                  <td className="p-4">{feature}</td>
                  {[free, member].map((v, i) => (
                    <td key={i} className="p-4 text-center">
                      {v ? <Check className="mx-auto size-4 text-primary" aria-label="Included" /> : <Minus className="mx-auto size-4 text-muted-foreground" aria-label="Not included" />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="relative mx-auto max-w-3xl px-4 pb-24 sm:px-6">
        <h2 className="font-display text-center text-3xl sm:text-4xl">Questions</h2>
        <div className="mt-8 space-y-3">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group rounded-xl border border-border bg-card p-5 open:border-primary/30">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                {q}
                <ChevronDown className="size-4 shrink-0 transition group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
