import Link from "next/link";
import { CircleCheck, CircleX } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { getMembership, getSessionForUser } from "@/lib/queries";
import { homeFor, requireUser } from "@/lib/session";
import { formatDate, formatNaira, MEMBERSHIP_PRICE_KOBO } from "@/lib/utils";

/**
 * Where checkout returns people. Paystack's callback will verify the reference
 * here; for now the server action already recorded the payment, so this page
 * reads the booking or membership back from Postgres.
 */
export default async function PaymentCallbackPage({ searchParams }: PageProps<"/payments/callback">) {
  const user = await requireUser();
  const params = await searchParams;
  const isSession = params.type === "session";
  const session = isSession && typeof params.booking === "string" ? await getSessionForUser(params.booking, user.id) : null;
  const membership = isSession ? null : await getMembership(user.id);
  const ok = params.status !== "failed" && (isSession ? !!session : !!membership);
  const trainer = session?.trainer.name;

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute left-1/2 top-10 size-[420px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
      <div className="relative mx-auto max-w-md px-4 py-24 text-center">
        <span className={`mx-auto grid size-20 place-items-center rounded-full ${ok ? "glow bg-primary text-primary-foreground" : "bg-destructive/15 text-destructive"}`}>
          {ok ? <CircleCheck className="size-10" /> : <CircleX className="size-10" />}
        </span>
        <h1 className="font-display mt-8 text-4xl">
          {!ok ? "Payment not confirmed" : isSession ? "Session booked!" : "Welcome to GuildFit!"}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {!ok
            ? "We couldn't confirm your payment. If you were charged, it'll show up in a minute."
            : isSession
              ? `Your 1:1 session${trainer ? ` with ${trainer}` : ""} is confirmed. You can join the video call from your dashboard 10 minutes before it starts.`
              : "Your membership is active. Every lesson in every program is now unlocked."}
        </p>

        {ok && (
          <div className="mt-8 rounded-2xl border border-border bg-card p-5 text-left text-sm">
            <div className="flex justify-between py-1.5"><span className="text-muted-foreground">Item</span><span>{session ? `1:1 with ${trainer}` : "GuildFit Monthly"}</span></div>
            {session && (
              <div className="flex justify-between py-1.5"><span className="text-muted-foreground">When</span><span>{formatDate(session.startsAt)} · {session.durationMin} min</span></div>
            )}
            {membership && (
              <div className="flex justify-between py-1.5"><span className="text-muted-foreground">Renews</span><span>{formatDate(membership.currentPeriodEnd, "date")}</span></div>
            )}
            <div className="flex justify-between py-1.5"><span className="text-muted-foreground">Amount</span><span className="font-semibold">{formatNaira(session ? session.amountKobo : MEMBERSHIP_PRICE_KOBO)}</span></div>
            <div className="flex justify-between py-1.5"><span className="text-muted-foreground">Reference</span><span className="font-mono text-xs">{session ? session.reference.slice(0, 15) : `gf_m_${user.id.slice(0, 8)}`}</span></div>
          </div>
        )}

        <div className="mt-8 flex justify-center gap-3">
          {ok ? (
            <>
              <Link href={isSession ? "/sessions" : "/programs"} className={buttonVariants({ size: "lg", className: "h-11 px-6 font-semibold" })}>
                {isSession ? "View my sessions" : "Start a program"}
              </Link>
              <Link href={homeFor(user.role)} className={buttonVariants({ size: "lg", variant: "outline", className: "h-11 px-6" })}>
                {user.role === "trainer" ? "Studio" : "My Library"}
              </Link>
            </>
          ) : (
            <Link href="/pricing" className={buttonVariants({ size: "lg", className: "h-11 px-6" })}>Try again</Link>
          )}
        </div>
      </div>
    </div>
  );
}
