"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarCheck, Clock, ShieldCheck, Video } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn, formatDate, formatNaira } from "@/lib/utils";

type SlotView = { id: string; startsAt: string; durationMin: number; priceKobo: number };

/** Pick a day, pick a time, "pay" (demo: goes straight to the success page). */
export function BookingCard({ slots, trainerName }: { slots: SlotView[]; trainerName: string }) {
  const router = useRouter();
  const days = useMemo(() => {
    const map = new Map<string, SlotView[]>();
    for (const s of slots) {
      const key = formatDate(s.startsAt, "short");
      map.set(key, [...(map.get(key) ?? []), s]);
    }
    return [...map.entries()];
  }, [slots]);

  const [dayIndex, setDayIndex] = useState(0);
  const [selected, setSelected] = useState<SlotView | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold">Book a 1:1 video session</h2>
          <p className="mt-1 text-sm text-muted-foreground">Pay securely with Paystack. No membership needed.</p>
        </div>
        <Video className="size-6 shrink-0 text-primary" />
      </div>

      <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto">
        {days.map(([day, daySlots], i) => (
          <button
            key={day}
            onClick={() => {
              setDayIndex(i);
              setSelected(null);
            }}
            className={cn(
              "shrink-0 rounded-xl border px-4 py-2.5 text-left transition",
              i === dayIndex ? "border-primary bg-primary/10" : "border-border hover:border-foreground/25",
            )}
          >
            <span className="block text-xs text-muted-foreground">{formatDate(daySlots[0].startsAt, "day").split(",")[0]}</span>
            <span className="block text-sm font-semibold">{day}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {days[dayIndex]?.[1].map((slot) => (
          <button
            key={slot.id}
            onClick={() => setSelected(slot)}
            className={cn(
              "rounded-xl border px-3 py-3 text-left transition",
              selected?.id === slot.id ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50",
            )}
          >
            <span className="block text-sm font-bold">{formatDate(slot.startsAt, "time")}</span>
            <span className={cn("text-xs", selected?.id === slot.id ? "text-primary-foreground/80" : "text-muted-foreground")}>
              {slot.durationMin} min · {formatNaira(slot.priceKobo)}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-3 border-t border-border pt-5">
        {selected && (
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Clock className="size-4" /> {formatDate(selected.startsAt)} · {selected.durationMin} min
            </span>
            <span className="font-bold">{formatNaira(selected.priceKobo)}</span>
          </div>
        )}
        <Button
          size="lg"
          className="h-12 w-full text-base font-semibold"
          disabled={!selected || pending}
          onClick={() => {
            setPending(true);
            toast.loading("Redirecting to Paystack… (demo)");
            setTimeout(() => router.push(`/payments/callback?type=session&trainer=${encodeURIComponent(trainerName)}`), 900);
          }}
        >
          <CalendarCheck />
          {selected ? `Book & pay ${formatNaira(selected.priceKobo)}` : "Select a time"}
        </Button>
        <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5" /> Your slot is held for 15 minutes while you pay
        </p>
      </div>
    </div>
  );
}
