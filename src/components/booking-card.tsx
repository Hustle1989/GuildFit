"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { CalendarCheck, CalendarX, CircleAlert, Loader2, ShieldCheck, Video } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { bookSlot, type BookingResult } from "@/lib/actions";
import { cn, dateParts, formatDate, formatNaira } from "@/lib/utils";

export type BookableSlot = { id: string; startsAt: string; durationMin: number; priceKobo: number; taken: boolean };

/**
 * "Book a 1:1 session": one card per day with its times. Taken times are struck
 * through. Picking a time opens the checkout bar; the server action locks the
 * slot, records the booking and credits the trainer (Paystack test-mode stand-in).
 */
export function BookingSection({
  slots,
  viewer,
  trainerName,
  defaultPriceKobo,
}: {
  slots: BookableSlot[];
  viewer: "anonymous" | "self" | "member";
  trainerName: string;
  defaultPriceKobo: number;
}) {
  const [state, formAction, pending] = useActionState<BookingResult, FormData>(bookSlot, {});
  const [selected, setSelected] = useState<BookableSlot | null>(null);
  const firstName = trainerName.split(" ")[0];

  const days = useMemo(() => {
    const map = new Map<string, { label: string; slots: BookableSlot[] }>();
    for (const s of slots) {
      const key = formatDate(s.startsAt, "short");
      const day = map.get(key) ?? { label: `${dateParts(s.startsAt).weekdayShort}, ${key}`, slots: [] };
      day.slots.push(s);
      map.set(key, day);
    }
    return [...map.values()];
  }, [slots]);

  const openPrices = slots.filter((s) => !s.taken).map((s) => s.priceKobo);
  const fromPrice = openPrices.length ? Math.min(...openPrices) : defaultPriceKobo;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-3xl">Book a 1:1 session</h2>
          <p className="mt-2 text-muted-foreground">
            Pick a time below. Times are shown in Lagos time (WAT) · secure checkout with Paystack.
          </p>
        </div>
        <p className="shrink-0 text-right">
          {new Set(openPrices).size > 1 && <span className="text-sm text-muted-foreground">from </span>}
          <span className="text-2xl font-bold tabular-nums">{formatNaira(fromPrice)}</span>
          <span className="text-sm text-muted-foreground"> / session</span>
        </p>
      </div>

      {days.length === 0 ? (
        <div className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-foreground/15 px-4 py-12 text-center text-sm text-muted-foreground">
          <CalendarX className="size-5" /> No open times right now. Check back soon or send {firstName} a message.
        </div>
      ) : (
        <div className="no-scrollbar -mx-4 mt-6 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:scroll-px-0 sm:px-0" role="list" aria-label="Available days">
          {days.map((day) => (
            <div key={day.label} role="listitem" className="w-[188px] shrink-0 snap-start rounded-2xl border border-border bg-card p-4">
              <p className="mb-3 text-sm font-semibold">{day.label}</p>
              <div className="space-y-2">
                {day.slots.map((slot) => {
                  const isSelected = selected?.id === slot.id;
                  const time = formatDate(slot.startsAt, "time");
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={slot.taken}
                      aria-pressed={isSelected}
                      aria-label={slot.taken ? `${day.label} ${time}, already booked` : `${day.label} ${time}, ${slot.durationMin} minutes, ${formatNaira(slot.priceKobo)}`}
                      title={slot.taken ? "Already booked" : `${slot.durationMin} min · ${formatNaira(slot.priceKobo)}`}
                      onClick={() => setSelected(isSelected ? null : slot)}
                      className={cn(
                        "h-10 w-full rounded-lg border text-sm font-medium tabular-nums transition",
                        slot.taken
                          ? "cursor-not-allowed border-transparent bg-foreground/[0.04] text-muted-foreground/60 line-through"
                          : isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background/40 hover:border-primary/60 hover:text-foreground",
                      )}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <form action={formAction} className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4 sm:p-5">
        <input type="hidden" name="slotId" value={selected?.id ?? ""} />
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
            <Video className="size-4.5" />
          </span>
          {selected ? (
            <div className="min-w-0 text-sm">
              <p className="font-semibold">
                {formatDate(selected.startsAt, "day")} · {formatDate(selected.startsAt, "time")}
              </p>
              <p className="text-muted-foreground">
                {selected.durationMin}-min video call with {firstName} · {formatNaira(selected.priceKobo)}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Select an open time to continue. Struck-through times are already booked.</p>
          )}
        </div>

        {viewer === "anonymous" ? (
          <Link href="/sign-in" className={buttonVariants({ className: "h-11 w-full px-6 font-semibold sm:w-auto" })}>
            Sign in to book
          </Link>
        ) : viewer === "self" ? (
          <p className="rounded-lg bg-foreground/5 px-3 py-2 text-sm text-muted-foreground">This is your public profile. Clients book here.</p>
        ) : (
          <Button type="submit" className="glow h-11 w-full px-6 font-semibold sm:w-auto" disabled={!selected || pending}>
            {pending ? <Loader2 className="animate-spin" /> : <CalendarCheck />}
            {pending ? "Processing payment…" : selected ? `Book & pay ${formatNaira(selected.priceKobo)}` : "Book & pay"}
          </Button>
        )}

        {state.error && (
          <p role="alert" className="flex w-full items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <CircleAlert className="mt-0.5 size-4 shrink-0" /> {state.error}
          </p>
        )}
      </form>
      <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5" /> Test mode: payment completes instantly and no card is charged.
      </p>
    </div>
  );
}
