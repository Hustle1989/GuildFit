import Link from "next/link";
import { CreditCard } from "lucide-react";
import { ActionForm } from "@/components/action-form";
import { EmptyState } from "@/components/empty-state";
import { LocalTime } from "@/components/local-time";
import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getMembership } from "@/lib/access";
import { requireProfile } from "@/lib/session";
import { cancelMembership } from "./actions";

const STATUS_LABEL = {
  active: "Active",
  non_renewing: "Cancelled: ends at period end",
  attention: "Payment failed",
  cancelled: "Cancelled",
} as const;

export default async function BillingPage() {
  const user = await requireProfile();
  const membership = await getMembership(user.id);
  const hasAccess = membership && membership.currentPeriodEnd > new Date();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-display mb-8 text-4xl">Billing</h1>
      {!membership ? (
        <EmptyState icon={CreditCard} title="No membership yet" description="Subscribe to unlock every program.">
          <Link href="/pricing" className={buttonVariants()}>See pricing</Link>
        </EmptyState>
      ) : (
        <div className="space-y-6 rounded-2xl border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">GuildFit Monthly</p>
              <p className="text-xl font-semibold">{hasAccess ? "You have full access" : "No active access"}</p>
            </div>
            <Badge variant={membership.status === "active" ? "default" : "secondary"}>{STATUS_LABEL[membership.status]}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            {membership.status === "active" ? "Renews" : "Access until"}: <LocalTime date={membership.currentPeriodEnd} mode="date" />
          </p>
          {membership.status === "active" && (
            <ActionForm action={cancelMembership} successMessage="Subscription cancelled. You keep access until the period ends.">
              <SubmitButton variant="destructive">Cancel subscription</SubmitButton>
            </ActionForm>
          )}
          {!hasAccess && (
            <Link href="/pricing" className={buttonVariants()}>Resubscribe</Link>
          )}
        </div>
      )}
    </div>
  );
}
