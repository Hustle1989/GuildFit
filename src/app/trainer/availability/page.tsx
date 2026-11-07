import type { Metadata } from "next";
import { PageHeader } from "@/components/app-ui";
import { getTrainerSlots, people } from "@/lib/mock-data";
import { AvailabilityManager, type SlotRow } from "./availability-manager";

export const metadata: Metadata = { title: "Slots & bookings" };

export default function AvailabilityPage() {
  const slots: SlotRow[] = getTrainerSlots().map((s) => ({
    id: s.id,
    startsAt: s.startsAt.toISOString(),
    durationMin: s.durationMin,
    priceKobo: s.priceKobo,
    status: s.status,
    client: s.clientId ? { name: people[s.clientId].name } : undefined,
  }));

  return (
    <>
      <PageHeader title="Slots & bookings" subtitle="Add times you're available. Clients pick a slot and pay, and it shows up here as booked." />
      <AvailabilityManager initialSlots={slots} />
    </>
  );
}
