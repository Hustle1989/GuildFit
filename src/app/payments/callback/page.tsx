import Link from "next/link";
import * as Sentry from "@sentry/nextjs";
import { CheckCircle2, XCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { fulfillPayment } from "@/lib/payments";

// Paystack redirects here after checkout. We verify the payment right away
// (the webhook does the same thing; fulfillPayment is idempotent).
export default async function PaymentCallbackPage({ searchParams }: PageProps<"/payments/callback">) {
  const { reference } = (await searchParams) as { reference?: string };

  let result: Awaited<ReturnType<typeof fulfillPayment>> | null = null;
  if (reference) {
    try {
      result = await fulfillPayment(reference);
    } catch (error) {
      Sentry.captureException(error, { tags: { flow: "payment-callback" } });
    }
  }

  const ok = result?.ok;
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      {ok ? <CheckCircle2 className="mx-auto size-12 text-primary" /> : <XCircle className="mx-auto size-12 text-destructive" />}
      <h1 className="mt-4 text-3xl font-bold">{ok ? "Payment successful" : "Payment not confirmed"}</h1>
      <p className="mt-2 text-muted-foreground">
        {result?.ok && result.type === "membership" && "Welcome to GuildFit. Every program is now unlocked."}
        {result?.ok && result.type === "session" && "Your session is booked. Join the call from your dashboard."}
        {!ok && "If you were charged, it will be confirmed shortly. Check your dashboard in a minute."}
      </p>
      <div className="mt-8 flex justify-center gap-3">
        {result?.ok && result.type === "session" ? (
          <Link href={`/sessions/${result.bookingId}`} className={buttonVariants({ size: "lg" })}>View session</Link>
        ) : (
          <Link href="/programs" className={buttonVariants({ size: "lg" })}>Browse programs</Link>
        )}
        <Link href="/dashboard" className={buttonVariants({ size: "lg", variant: "outline" })}>Dashboard</Link>
      </div>
    </div>
  );
}
