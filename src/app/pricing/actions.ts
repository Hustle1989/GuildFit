"use server";

import { redirect } from "next/navigation";
import { hasActiveMembership } from "@/lib/access";
import { appUrl, env } from "@/lib/env";
import { initializeTransaction } from "@/lib/paystack";
import { requireProfile } from "@/lib/session";
import { MEMBERSHIP_PRICE_KOBO } from "@/lib/utils";

/** Start a Paystack subscription checkout for the monthly plan. */
export async function startMembership() {
  const user = await requireProfile();
  if (await hasActiveMembership(user.id)) redirect("/billing");

  const checkout = await initializeTransaction({
    email: user.email,
    plan: env("PAYSTACK_PLAN_CODE"), // the plan's price overrides `amount`
    amountKobo: MEMBERSHIP_PRICE_KOBO,
    callbackUrl: `${appUrl()}/payments/callback`,
    metadata: { type: "membership", userId: user.id },
  });
  redirect(checkout.authorization_url);
}
