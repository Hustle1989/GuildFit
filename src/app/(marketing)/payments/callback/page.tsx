import Link from "next/link";
import { CircleCheck, CircleX } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { formatNaira } from "@/lib/utils";

/** Where Paystack sends people back after checkout. Demo: ?type=membership|session, ?status=failed. */
export default async function PaymentCallbackPage({ searchParams }: PageProps<"/payments/callback">) {
  const { type, status, trainer } = (await searchParams) as { type?: string; status?: string; trainer?: string };
  const ok = status !== "failed";
  const isSession = type === "session";

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
            <div className="flex justify-between py-1.5"><span className="text-muted-foreground">Item</span><span>{isSession ? "1:1 video session" : "GuildFit Monthly"}</span></div>
            <div className="flex justify-between py-1.5"><span className="text-muted-foreground">Amount</span><span className="font-semibold">{formatNaira(isSession ? 1_500_000 : 500_000)}</span></div>
            <div className="flex justify-between py-1.5"><span className="text-muted-foreground">Reference</span><span className="font-mono text-xs">gf_8f2c91d4</span></div>
          </div>
        )}

        <div className="mt-8 flex justify-center gap-3">
          {ok ? (
            <>
              <Link href={isSession ? "/sessions" : "/programs"} className={buttonVariants({ size: "lg", className: "h-11 px-6 font-semibold" })}>
                {isSession ? "View my sessions" : "Start a program"}
              </Link>
              <Link href="/dashboard" className={buttonVariants({ size: "lg", variant: "outline", className: "h-11 px-6" })}>Dashboard</Link>
            </>
          ) : (
            <Link href="/pricing" className={buttonVariants({ size: "lg", className: "h-11 px-6" })}>Try again</Link>
          )}
        </div>
      </div>
    </div>
  );
}
