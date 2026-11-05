import Link from "next/link";
import { CalendarPlus, Trash2 } from "lucide-react";
import { ActionForm } from "@/components/action-form";
import { EmptyState } from "@/components/empty-state";
import { LocalTime } from "@/components/local-time";
import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui/badge";
import { listTrainerSlots } from "@/lib/queries";
import { requireTrainer } from "@/lib/session";
import { formatNaira } from "@/lib/utils";
import { deleteSlot } from "./actions";
import { SlotForm } from "./slot-form";

export default async function AvailabilityPage() {
  const user = await requireTrainer();
  const rows = await listTrainerSlots(user.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Availability</h1>
        <p className="text-muted-foreground">Add 1:1 video slots. Clients book and pay through Paystack.</p>
      </div>
      <SlotForm />

      {rows.length === 0 ? (
        <EmptyState icon={CalendarPlus} title="No upcoming slots" description="Add a slot above so clients can book you." />
      ) : (
        <ul className="divide-y rounded-2xl border bg-card">
          {rows.map((slot) => (
            <li key={slot.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
              <div>
                <p className="font-medium"><LocalTime date={slot.startsAt} /></p>
                <p className="text-sm text-muted-foreground">{slot.durationMin} min · {formatNaira(slot.priceKobo)}</p>
              </div>
              <div className="flex items-center gap-2">
                {slot.state === "booked" && (
                  <>
                    <Badge>Booked · {slot.clientName}</Badge>
                    <Link href={`/sessions/${slot.bookingId}`} className="text-sm text-primary hover:underline">Open</Link>
                  </>
                )}
                {slot.state === "held" && <Badge variant="secondary">Checkout in progress</Badge>}
                {slot.state === "open" && (
                  <>
                    <Badge variant="outline">Open</Badge>
                    <ActionForm action={deleteSlot} successMessage="Slot removed">
                      <input type="hidden" name="slotId" value={slot.id} />
                      <SubmitButton variant="ghost" size="icon-sm" aria-label="Delete slot"><Trash2 /></SubmitButton>
                    </ActionForm>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
