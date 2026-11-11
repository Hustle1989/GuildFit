import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SessionDetail } from "@/components/session-detail";
import { getSessionForUser, getTrainerById } from "@/lib/queries";
import { requireClient } from "@/lib/session";
import { DEFAULT_TRAINER_IMAGE } from "@/lib/types";

export const metadata: Metadata = { title: "1:1 session" };

export default async function SessionPage({ params }: PageProps<"/sessions/[bookingId]">) {
  const user = await requireClient();
  const session = await getSessionForUser((await params).bookingId, user.id);
  if (!session || session.client.id !== user.id) notFound();
  const coach = await getTrainerById(session.trainer.id);

  return (
    <SessionDetail
      me={{ name: session.client.name, image: session.client.avatarUrl ?? DEFAULT_TRAINER_IMAGE }}
      other={{ name: session.trainer.name, image: coach?.image ?? session.trainer.avatarUrl ?? DEFAULT_TRAINER_IMAGE }}
      startsAt={session.startsAt}
      durationMin={session.durationMin}
      amountKobo={session.amountKobo}
      backHref="/sessions"
    />
  );
}
