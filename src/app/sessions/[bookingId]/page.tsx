import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { alias } from "drizzle-orm/pg-core";
import { eq } from "drizzle-orm";
import { Clock } from "lucide-react";
import { LocalTime } from "@/components/local-time";
import { bookings, db, profiles, slots } from "@/db";
import { requireProfile } from "@/lib/session";
import { getOrCreateSessionCall, upsertStreamUser } from "@/lib/stream";
import { joinWindow } from "@/lib/utils";
import { SessionCall } from "./session-call";
import { RefreshButton } from "./refresh-button";

export const metadata: Metadata = { title: "1:1 session" };

const client = alias(profiles, "client");
const trainer = alias(profiles, "trainer");

export default async function SessionPage({ params }: PageProps<"/sessions/[bookingId]">) {
  const user = await requireProfile();
  const { bookingId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(bookingId)) notFound();

  const [session] = await db
    .select({
      id: bookings.id,
      status: bookings.status,
      startsAt: slots.startsAt,
      durationMin: slots.durationMin,
      clientId: client.id,
      clientName: client.name,
      clientImage: client.avatarUrl,
      trainerId: trainer.id,
      trainerName: trainer.name,
      trainerImage: trainer.avatarUrl,
    })
    .from(bookings)
    .innerJoin(slots, eq(slots.id, bookings.slotId))
    .innerJoin(client, eq(client.id, bookings.clientId))
    .innerJoin(trainer, eq(trainer.id, bookings.trainerId))
    .where(eq(bookings.id, bookingId));

  // Only the two participants of a paid booking may see it.
  if (!session || session.status !== "paid" || ![session.clientId, session.trainerId].includes(user.id)) notFound();

  const { opensAt, closesAt } = joinWindow(session.startsAt, session.durationMin);
  const now = new Date();
  const canJoin = now >= opensAt && now <= closesAt;
  const otherName = user.id === session.clientId ? session.trainerName : session.clientName;

  if (canJoin) {
    await Promise.all([
      upsertStreamUser({ id: session.clientId, name: session.clientName, image: session.clientImage }),
      upsertStreamUser({ id: session.trainerId, name: session.trainerName, image: session.trainerImage }),
    ]);
    await getOrCreateSessionCall(session.id, session.clientId, session.trainerId);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="font-display text-4xl">Session with {otherName}</h1>
      <p className="mb-8 mt-2 text-muted-foreground">
        <LocalTime date={session.startsAt} /> · {session.durationMin} min
      </p>

      {canJoin ? (
        <SessionCall
          callId={session.id}
          apiKey={process.env.NEXT_PUBLIC_STREAM_API_KEY ?? ""}
          user={{ id: user.id, name: user.name, image: user.image ?? undefined }}
        />
      ) : (
        <div className="rounded-2xl border bg-card p-10 text-center">
          <Clock className="mx-auto mb-3 size-8 text-primary" />
          {now < opensAt ? (
            <>
              <p className="text-lg font-semibold">The call opens 10 minutes before the start time.</p>
              <p className="mb-6 text-muted-foreground">Opens at <LocalTime date={opensAt} mode="time" /></p>
              <RefreshButton />
            </>
          ) : (
            <p className="text-lg font-semibold">This session has ended.</p>
          )}
        </div>
      )}
    </div>
  );
}
