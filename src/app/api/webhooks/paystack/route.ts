import * as Sentry from "@sentry/nextjs";
import { eq } from "drizzle-orm";
import { db, webhookEvents } from "@/db";
import { isValidSignature, type PaystackEventData } from "@/lib/paystack";
import { fulfillPayment, handleSubscriptionEvent } from "@/lib/payments";

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!isValidSignature(rawBody, request.headers.get("x-paystack-signature"))) {
    return new Response("Invalid signature", { status: 401 });
  }

  const { event, data } = JSON.parse(rawBody) as { event: string; data: PaystackEventData };
  Sentry.setTag("paystack.event", event);

  // Dedupe: Paystack retries, and you can resend events from the dashboard.
  const key = `${event}:${data.id ?? data.subscription_code ?? data.reference}`;
  const inserted = await db.insert(webhookEvents).values({ key }).onConflictDoNothing().returning();
  if (inserted.length === 0) return Response.json({ ok: true, duplicate: true });

  try {
    if (event === "charge.success" && data.reference) {
      await fulfillPayment(data.reference);
    } else {
      await handleSubscriptionEvent(event, data);
    }
  } catch (error) {
    Sentry.captureException(error);
    // Forget the event so Paystack's retry gets processed.
    await db.delete(webhookEvents).where(eq(webhookEvents.key, key));
    return new Response("Webhook handler failed", { status: 500 });
  }

  return Response.json({ ok: true });
}
