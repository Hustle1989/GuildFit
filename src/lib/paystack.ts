import "server-only";
import crypto from "node:crypto";
import { env } from "@/lib/env";

const BASE = "https://api.paystack.co";

async function paystack<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env("PAYSTACK_SECRET_KEY")}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
  const json = await res.json();
  if (!res.ok || !json.status) {
    throw new Error(`Paystack ${path} failed: ${json.message ?? res.statusText}`);
  }
  return json.data as T;
}

export type PaymentMetadata =
  | { type: "membership"; userId: string }
  | { type: "session"; bookingId: string };

export function initializeTransaction(input: {
  email: string;
  amountKobo?: number;
  plan?: string;
  reference?: string;
  callbackUrl: string;
  metadata: PaymentMetadata;
}) {
  return paystack<{ authorization_url: string; reference: string }>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      amount: input.amountKobo,
      plan: input.plan,
      reference: input.reference,
      callback_url: input.callbackUrl,
      metadata: input.metadata,
    }),
  });
}

export type PaystackTransaction = {
  status: string; // "success" when paid
  reference: string;
  amount: number; // kobo
  metadata: PaymentMetadata | string | null;
  customer: { email: string; customer_code: string };
  plan: string | null | { plan_code?: string };
};

/** The fields we read from Paystack webhook payloads. */
export type PaystackEventData = {
  id?: number | string;
  reference?: string;
  status?: string;
  paid?: boolean;
  subscription_code?: string;
  email_token?: string;
  next_payment_date?: string;
  customer?: { email?: string; customer_code?: string };
  subscription?: { next_payment_date?: string };
};

export function verifyTransaction(reference: string) {
  return paystack<PaystackTransaction>(`/transaction/verify/${encodeURIComponent(reference)}`);
}

export function disableSubscription(code: string, token: string) {
  return paystack("/subscription/disable", {
    method: "POST",
    body: JSON.stringify({ code, token }),
  });
}

/** Paystack signs the raw body with HMAC-SHA512 using your secret key. */
export function isValidSignature(rawBody: string, signature: string | null) {
  if (!signature) return false;
  const hash = crypto.createHmac("sha512", env("PAYSTACK_SECRET_KEY")).update(rawBody).digest("hex");
  const a = Buffer.from(hash);
  const b = Buffer.from(signature);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
