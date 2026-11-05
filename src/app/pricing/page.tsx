import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/submit-button";
import { buttonVariants } from "@/components/ui/button";
import { hasActiveMembership } from "@/lib/access";
import { getCurrentUser } from "@/lib/session";
import { formatNaira, MEMBERSHIP_PRICE_KOBO } from "@/lib/utils";
import { startMembership } from "./actions";

export const metadata: Metadata = {
  title: "Membership pricing",
  description: "One GuildFit membership unlocks every workout program from every trainer.",
};

const PERKS = [
  "Every lesson in every program",
  "New programs as trainers publish them",
  "Track your progress lesson by lesson",
  "Cancel anytime: access lasts to the end of your month",
];

export default async function PricingPage() {
  const user = await getCurrentUser();
  const isMember = user ? await hasActiveMembership(user.id) : false;

  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center">
      <h1 className="font-display text-5xl sm:text-6xl">One membership. Every program.</h1>
      <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
        1:1 video sessions are booked separately with each trainer.
      </p>

      <div className="mx-auto mt-12 max-w-md rounded-3xl border border-primary/40 bg-card p-8 text-left shadow-[0_0_80px_-20px_oklch(0.9_0.21_125/0.35)]">
        <p className="text-sm font-semibold uppercase tracking-wider text-primary">GuildFit Monthly</p>
        <p className="mt-2 text-5xl font-black tracking-tight">
          {formatNaira(MEMBERSHIP_PRICE_KOBO)}
          <span className="text-base font-medium text-muted-foreground"> / month</span>
        </p>
        <ul className="my-8 space-y-3">
          {PERKS.map((perk) => (
            <li key={perk} className="flex gap-3 text-sm">
              <Check className="size-4 shrink-0 text-primary" /> {perk}
            </li>
          ))}
        </ul>

        {isMember ? (
          <Link href="/billing" className={buttonVariants({ size: "lg", variant: "secondary", className: "h-11 w-full" })}>
            You&apos;re a member · Manage billing
          </Link>
        ) : user ? (
          <ActionForm action={startMembership}>
            <SubmitButton size="lg" className="h-11 w-full">Subscribe with Paystack</SubmitButton>
          </ActionForm>
        ) : (
          <Link href="/sign-up" className={buttonVariants({ size: "lg", className: "h-11 w-full" })}>
            Create an account to subscribe
          </Link>
        )}
      </div>
    </div>
  );
}
