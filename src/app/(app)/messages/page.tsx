import type { Metadata } from "next";
import { PageHeader } from "@/components/app-ui";
import { Messenger } from "@/components/messenger";
import { currentClient, getClientConversations, people } from "@/lib/mock-data";
import { listClientSessions } from "@/lib/queries";
import { requireClient } from "@/lib/session";
import { DEFAULT_TRAINER_IMAGE } from "@/lib/types";
import { sessionState } from "@/lib/utils";

export const metadata: Metadata = { title: "Messages" };

/** Chat is still the Stream stand-in: sample conversations, shown from the signed-in member's side. */
export default async function MessagesPage() {
  const user = await requireClient();
  const next = (await listClientSessions(user.id)).find((s) => sessionState(s.startsAt, s.durationMin) !== "ended");
  const cast = { ...people, [currentClient.id]: { ...people[currentClient.id], name: user.name, image: user.image ?? DEFAULT_TRAINER_IMAGE } };
  return (
    <>
      <PageHeader title="Messages" subtitle="Sample conversations until Stream Chat is connected. Reactions and threads work locally." />
      <Messenger meId={currentClient.id} people={cast} initialConversations={getClientConversations()} callHref={next ? `/sessions/${next.id}` : "/sessions"} />
    </>
  );
}
