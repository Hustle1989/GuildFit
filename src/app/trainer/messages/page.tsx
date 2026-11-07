import type { Metadata } from "next";
import { PageHeader } from "@/components/app-ui";
import { Messenger } from "@/components/messenger";
import { currentTrainer, getTrainerConversations, people } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Messages" };

export default function TrainerMessagesPage() {
  return (
    <>
      <PageHeader title="Messages" subtitle="Reply to clients, react, and keep feedback organised in threads." />
      <Messenger meId={currentTrainer.id} people={people} initialConversations={getTrainerConversations()} callHref="/trainer/sessions/s1" />
    </>
  );
}
