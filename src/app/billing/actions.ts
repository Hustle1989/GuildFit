"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, memberships } from "@/db";
import { getMembership } from "@/lib/access";
import { disableSubscription } from "@/lib/paystack";
import { requireProfile } from "@/lib/session";

/** Stop renewals. Access continues until the end of the paid month. */
export async function cancelMembership() {
  const user = await requireProfile();
  const membership = await getMembership(user.id);
  if (!membership?.subscriptionCode || !membership.emailToken) {
    return { error: "Your subscription is still being set up. Try again in a minute." };
  }

  await disableSubscription(membership.subscriptionCode, membership.emailToken);
  await db.update(memberships).set({ status: "non_renewing" }).where(eq(memberships.userId, user.id));
  revalidatePath("/billing");
  return { ok: true };
}
