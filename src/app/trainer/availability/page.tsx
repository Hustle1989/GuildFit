import type { Metadata } from "next";
import { PageHeader } from "@/components/app-ui";
import { getTrainerById, listTrainerSlots } from "@/lib/queries";
import { requireTrainer } from "@/lib/session";
import { AvailabilityManager, type SlotRow } from "./availability-manager";

export const metadata: Metadata = { title: "Slots & bookings" };

export default async function AvailabilityPage() {
  const user = await requireTrainer();
  const [rows, trainer] = await Promise.all([listTrainerSlots(user.id), getTrainerById(user.id)]);
  const slots: SlotRow[] = rows.map((s) => ({
    id: s.id,
    startsAt: s.startsAt.toISOString(),
    durationMin: s.durationMin,
    priceKobo: s.priceKobo,
    status: s.status,
    bookingId: s.bookingId,
    client: s.client ? { name: s.client.name } : undefined,
  }));

  return (
    <>
      <PageHeader title="Slots & bookings" subtitle="Add times you're available. Clients pick a slot and pay, and it shows up here as booked." />
      <AvailabilityManager initialSlots={slots} defaultPriceNaira={(trainer?.sessionPriceKobo ?? 1_500_000) / 100} />
    </>
  );
}
