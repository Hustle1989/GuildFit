import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SessionDetail } from "@/components/session-detail";
import { currentClient, getMyBookings, trainerById } from "@/lib/mock-data";

export const metadata: Metadata = { title: "1:1 session" };

export default async function SessionPage({ params }: PageProps<"/sessions/[bookingId]">) {
  const { bookingId } = await params;
  const booking = getMyBookings().find((b) => b.id === bookingId);
  const trainer = booking && trainerById(booking.trainerId);
  if (!booking || !trainer) notFound();

  return (
    <SessionDetail
      me={currentClient}
      other={trainer}
      startsAt={booking.startsAt}
      durationMin={booking.durationMin}
      amountKobo={booking.amountKobo}
      backHref="/dashboard"
    />
  );
}
