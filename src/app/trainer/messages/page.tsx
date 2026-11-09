import type { Metadata } from "next";
import { PageHeader } from "@/components/app-ui";
import { Messenger } from "@/components/messenger";
import { currentTrainer, getTrainerConversations, people } from "@/lib/mock-data";
import { listTrainerSlots } from "@/lib/queries";
import { requireTrainer } from "@/lib/session";
import { DEFAULT_TRAINER_IMAGE } from "@/lib/types";

export const metadata: Metadata = { title: "Messages" };

/** Chat is still the Stream stand-in: sample conversations, shown from the signed-in coach's side. */
export default async function TrainerMessagesPage() {
  const user = await requireTrainer();
  const next = (await listTrainerSlots(user.id)).find((s) => s.status === "booked" && s.bookingId);
  const cast = { ...people, [currentTrainer.id]: { ...people[currentTrainer.id], name: user.name, image: user.image ?? DEFAULT_TRAINER_IMAGE } };
  return (
    <>
      <PageHeader title="Messages" subtitle="Sample conversations until Stream Chat is connected. Reactions and threads work locally." />
      <Messenger
        meId={currentTrainer.id}
        people={cast}
        initialConversations={getTrainerConversations()}
        callHref={next ? `/trainer/sessions/${next.bookingId}` : "/trainer/availability"}
      />
    </>
  );
}
