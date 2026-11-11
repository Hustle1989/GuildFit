import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SessionDetail } from "@/components/session-detail";
import { getSessionForUser } from "@/lib/queries";
import { requireTrainer } from "@/lib/session";
import { DEFAULT_TRAINER_IMAGE } from "@/lib/types";

export const metadata: Metadata = { title: "1:1 session" };

export default async function TrainerSessionPage({ params }: PageProps<"/trainer/sessions/[bookingId]">) {
  const user = await requireTrainer();
  const session = await getSessionForUser((await params).bookingId, user.id);
  if (!session || session.trainer.id !== user.id) notFound();

  return (
    <SessionDetail
      me={{ name: session.trainer.name, image: session.trainer.avatarUrl ?? DEFAULT_TRAINER_IMAGE }}
      other={{ name: session.client.name, image: session.client.avatarUrl ?? DEFAULT_TRAINER_IMAGE }}
      startsAt={session.startsAt}
      durationMin={session.durationMin}
      amountKobo={session.amountKobo}
      backHref="/trainer/availability"
    />
  );
}
