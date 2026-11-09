"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Banknote, Clock, Loader2, Plus, Trash, Video } from "lucide-react";
import { toast } from "sonner";
import { InitialsAvatar, StatusPill } from "@/components/app-ui";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate, formatNaira } from "@/lib/utils";
import { addSlot, deleteSlot } from "../actions";

export type SlotRow = {
  id: string;
  startsAt: string;
  durationMin: number;
  priceKobo: number;
  status: "open" | "held" | "booked";
  bookingId?: string | null;
  client?: { name: string };
};

export function AvailabilityManager({ initialSlots, defaultPriceNaira }: { initialSlots: SlotRow[]; defaultPriceNaira: number }) {
  const [slots, setSlots] = useState(initialSlots);
  const [adding, startAdding] = useTransition();
  const [removing, setRemoving] = useState<string | null>(null);

  const byDay = useMemo(() => {
    const map = new Map<string, SlotRow[]>();
    for (const s of [...slots].sort((a, b) => a.startsAt.localeCompare(b.startsAt))) {
      const key = formatDate(s.startsAt, "day");
      map.set(key, [...(map.get(key) ?? []), s]);
    }
    return [...map.entries()];
  }, [slots]);

  const count = (status: SlotRow["status"]) => slots.filter((s) => s.status === status).length;

  return (
    <div className="grid items-start gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
      <div className="space-y-4 lg:sticky lg:top-8">
        <form
          className="space-y-4 rounded-2xl border border-border bg-card p-5"
          onSubmit={(e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const data = new FormData(form);
            const local = String(data.get("startsAt"));
            // GuildFit shows every time in Lagos time (WAT, UTC+1, no daylight saving), so read the input the same way.
            const startsAt = local ? new Date(`${local}:00+01:00`) : null;
            if (!startsAt || Number.isNaN(startsAt.getTime()) || startsAt.getTime() < Date.now()) return toast.error("Pick a time in the future.");
            startAdding(async () => {
              const result = await addSlot({
                startsAt: startsAt.toISOString(), // WAT -> UTC
                durationMin: Number(data.get("duration")) as 30 | 45 | 60,
                priceNaira: Number(data.get("price")),
              });
              if (!result.ok) return void toast.error(result.error);
              setSlots((s) => [...s, { ...result.slot, status: "open" }]);
              form.reset();
              toast.success("Slot added. Clients can book it now.");
            });
          }}
        >
          <h2 className="font-semibold">Add a slot</h2>
          <div className="space-y-1.5">
            <Label htmlFor="startsAt">
              Date &amp; time <span className="font-normal text-muted-foreground">(Lagos time, WAT)</span>
            </Label>
            <Input id="startsAt" name="startsAt" type="datetime-local" required className="h-10" />
          </div>
          <div className="divide-y divide-border/60 text-sm">
            <label className="flex items-center justify-between gap-3 py-2.5">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Clock className="size-4" /> Duration
              </span>
              <select name="duration" defaultValue="60" className="cursor-pointer bg-transparent text-right font-semibold outline-none">
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">60 min</option>
              </select>
            </label>
            <label className="flex items-center justify-between gap-3 py-2.5">
              <span className="flex items-center gap-2 text-muted-foreground">
                <Banknote className="size-4" /> Price
              </span>
              <span className="flex items-center gap-0.5 font-semibold">
                ₦
                <input
                  name="price"
                  type="number"
                  min={1000}
                  step={500}
                  defaultValue={defaultPriceNaira}
                  required
                  aria-label="Price in naira"
                  className="field-sizing-content min-w-10 bg-transparent text-right tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                />
              </span>
            </label>
          </div>
          <Button type="submit" className="glow h-10 w-full rounded-xl font-semibold" disabled={adding}>
            {adding ? <Loader2 className="animate-spin" /> : <Plus />} Add slot
          </Button>
        </form>

        <div className="grid grid-cols-3 gap-3">
          {(
            [
              ["open", "Open"],
              ["held", "Held"],
              ["booked", "Booked"],
            ] as const
          ).map(([status, label]) => (
            <div key={status} className="rounded-2xl border border-border bg-card py-4 text-center">
              <p className="text-2xl font-bold tabular-nums">{count(status)}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {byDay.map(([day, daySlots]) => (
          <section key={day} className="overflow-hidden rounded-2xl border border-border bg-card">
            <h3 className="border-b border-border/60 px-4 py-3 text-sm font-semibold">{day}</h3>
            <ul className="divide-y divide-border/60">
              {daySlots.map((slot) => (
                <li key={slot.id} className="flex min-h-14 flex-wrap items-center gap-x-3 gap-y-2 px-4 py-2.5">
                  <p className="w-[72px] text-sm font-semibold tabular-nums">{formatDate(slot.startsAt, "time")}</p>
                  {slot.status === "booked" && <StatusPill tone="solid">Booked</StatusPill>}
                  {slot.status === "held" && <StatusPill tone="amber">Held · checkout in progress</StatusPill>}
                  {slot.status === "open" && <StatusPill tone="muted">Open</StatusPill>}
                  {slot.client && (
                    <span className="flex items-center gap-2 text-sm">
                      <InitialsAvatar name={slot.client.name} size={26} />
                      {slot.client.name}
                    </span>
                  )}
                  <span className="ml-auto hidden text-xs text-muted-foreground sm:block">
                    {slot.durationMin} min · {formatNaira(slot.priceKobo)}
                  </span>
                  <span className="ml-auto flex w-[92px] justify-end sm:ml-0">
                    {slot.status === "booked" && (
                      <Link
                        href={`/trainer/sessions/${slot.bookingId}`}
                        className={buttonVariants({ variant: "outline", className: "h-8 gap-1.5 px-3 text-xs font-medium" })}
                      >
                        <Video className="size-3.5" /> Join call
                      </Link>
                    )}
                    {slot.status === "open" && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Delete ${formatDate(slot.startsAt)} slot`}
                        className="text-muted-foreground hover:text-destructive"
                        disabled={removing === slot.id}
                        onClick={async () => {
                          setRemoving(slot.id);
                          const result = await deleteSlot(slot.id);
                          setRemoving(null);
                          if (!result.ok) return void toast.error(result.error);
                          setSlots((s) => s.filter((x) => x.id !== slot.id));
                          toast.success("Slot removed");
                        }}
                      >
                        {removing === slot.id ? <Loader2 className="animate-spin" /> : <Trash />}
                      </Button>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
