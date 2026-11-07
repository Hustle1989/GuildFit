import type { Metadata } from "next";
import { PageHeader } from "@/components/app-ui";
import { Messenger } from "@/components/messenger";
import { currentClient, getClientConversations, people } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Messages" };

export default function MessagesPage() {
  return (
    <>
      <PageHeader title="Messages" subtitle="Chat with your coaches. Hover a message to react or reply in a thread." />
      <Messenger meId={currentClient.id} people={people} initialConversations={getClientConversations()} callHref="/sessions/b1" />
    </>
  );
}
