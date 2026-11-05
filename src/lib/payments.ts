import "server-only";
import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { bookings, db, earnings, memberships, profiles } from "@/db";
import { splitFee } from "@/lib/utils";
import { verifyTransaction, type PaymentMetadata, type PaystackEventData } from "@/lib/paystack";

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

function parseMetadata(raw: unknown): PaymentMetadata | null {
  const value = typeof raw === "string" ? safeJson(raw) : raw;
  if (value && typeof value === "object" && "type" in value) return value as PaymentMetadata;
  return null;
}
function safeJson(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return null;
  }
}

/**
 * Verify a Paystack reference and apply its effect. Idempotent: the callback
 * page and the webhook can both call it for the same payment.
 */
export async function fulfillPayment(reference: string) {
  const tx = await verifyTransaction(reference);
  if (tx.status !== "success") return { ok: false as const, reason: "not_paid" };

  const meta = parseMetadata(tx.metadata);
  Sentry.setContext("payment", { reference, type: meta?.type });

  if (meta?.type === "membership") {
    await activateMembership(meta.userId, tx.customer.customer_code);
    return { ok: true as const, type: "membership" as const };
  }

  if (meta?.type === "session") {
    await markBookingPaid(meta.bookingId, tx.amount);
    return { ok: true as const, type: "session" as const, bookingId: meta.bookingId };
  }

  // Monthly renewals carry no metadata; invoice.update extends the period instead.
  if (tx.plan) return { ok: false as const, reason: "renewal" };

  Sentry.captureMessage(`Paystack payment with unknown metadata: ${reference}`);
  return { ok: false as const, reason: "unknown_metadata" };
}

/** Gives instant access after checkout. The subscription webhook fills in the rest. */
async function activateMembership(userId: string, customerCode: string) {
  const provisionalEnd = new Date(Date.now() + ONE_MONTH_MS);
  await db
    .insert(memberships)
    .values({ userId, customerCode, status: "active", currentPeriodEnd: provisionalEnd })
    .onConflictDoUpdate({
      target: memberships.userId,
      set: { customerCode, status: "active", currentPeriodEnd: provisionalEnd },
    });
}

async function markBookingPaid(bookingId: string, amountPaidKobo: number) {
  await db.transaction(async (trx) => {
    const [booking] = await trx.select().from(bookings).where(eq(bookings.id, bookingId)).for("update");
    if (!booking) {
      // The hold expired and someone else took the slot. Needs a manual refund (v2).
      Sentry.captureMessage(`Paid booking not found: ${bookingId}`, "error");
      return;
    }
    if (booking.status === "paid") return; // already processed
    if (amountPaidKobo < booking.amountKobo) {
      Sentry.captureMessage(`Underpaid booking ${bookingId}`, "error");
      return;
    }

    await trx.update(bookings).set({ status: "paid", paidAt: new Date() }).where(eq(bookings.id, booking.id));
    await trx
      .insert(earnings)
      .values({ trainerId: booking.trainerId, bookingId: booking.id, ...splitFee(booking.amountKobo) })
      .onConflictDoNothing({ target: earnings.bookingId });
  });
}

/** Subscription lifecycle events from the Paystack webhook. */
export async function handleSubscriptionEvent(event: string, data: PaystackEventData) {
  const email = data.customer?.email;
  if (!email) return;
  const [profile] = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.email, email));
  if (!profile) return;

  const nextPayment = data.next_payment_date ? new Date(data.next_payment_date) : undefined;

  switch (event) {
    case "subscription.create":
      await db
        .insert(memberships)
        .values({
          userId: profile.id,
          customerCode: data.customer?.customer_code,
          subscriptionCode: data.subscription_code,
          emailToken: data.email_token,
          status: "active",
          currentPeriodEnd: nextPayment ?? new Date(Date.now() + ONE_MONTH_MS),
        })
        .onConflictDoUpdate({
          target: memberships.userId,
          set: {
            subscriptionCode: data.subscription_code,
            emailToken: data.email_token,
            status: "active",
            ...(nextPayment && { currentPeriodEnd: nextPayment }),
          },
        });
      break;
    case "invoice.update":
      if (data.paid || data.status === "success") {
        const end = data.subscription?.next_payment_date;
        await db
          .update(memberships)
          .set({ status: "active", ...(end && { currentPeriodEnd: new Date(end) }) })
          .where(eq(memberships.userId, profile.id));
      }
      break;
    case "invoice.payment_failed":
      await db.update(memberships).set({ status: "attention" }).where(eq(memberships.userId, profile.id));
      break;
    case "subscription.not_renew":
      await db.update(memberships).set({ status: "non_renewing" }).where(eq(memberships.userId, profile.id));
      break;
    case "subscription.disable":
      await db.update(memberships).set({ status: "cancelled" }).where(eq(memberships.userId, profile.id));
      break;
  }
}
