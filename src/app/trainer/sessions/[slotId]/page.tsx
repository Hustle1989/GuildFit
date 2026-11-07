import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SessionDetail } from "@/components/session-detail";
import { currentTrainer, getTrainerSlots, people } from "@/lib/mock-data";

export const metadata: Metadata = { title: "1:1 session" };

export default async function TrainerSessionPage({ params }: PageProps<"/trainer/sessions/[slotId]">) {
  const { slotId } = await params;
  const slot = getTrainerSlots().find((s) => s.id === slotId && s.status === "booked");
  const client = slot?.clientId ? people[slot.clientId] : undefined;
  if (!slot || !client) notFound();

  return (
    <SessionDetail
      me={currentTrainer}
      other={client}
      startsAt={slot.startsAt}
      durationMin={slot.durationMin}
      amountKobo={slot.priceKobo}
      backHref="/trainer"
    />
  );
}
