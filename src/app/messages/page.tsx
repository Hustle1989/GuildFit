import type { Metadata } from "next";
import { requireProfile } from "@/lib/session";
import { upsertStreamUser } from "@/lib/stream";
import { Messenger } from "./messenger";

export const metadata: Metadata = { title: "Messages" };

export default async function MessagesPage({ searchParams }: PageProps<"/messages">) {
  const user = await requireProfile();
  const { c } = (await searchParams) as { c?: string };

  // Make sure this user exists in Stream (cheap, idempotent).
  await upsertStreamUser({ id: user.id, name: user.name, image: user.image });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-display mb-6 text-4xl">Messages</h1>
      <Messenger
        apiKey={process.env.NEXT_PUBLIC_STREAM_API_KEY ?? ""}
        user={{ id: user.id, name: user.name, image: user.image ?? undefined }}
        initialChannelId={c}
      />
    </div>
  );
}
