"use client";

import {
  Channel,
  ChannelHeader,
  ChannelList,
  Chat,
  MessageComposer,
  MessageList,
  Thread,
  Window,
  useCreateChatClient,
} from "stream-chat-react";
import { Loader2 } from "lucide-react";
import "stream-chat-react/dist/css/index.css";

const tokenProvider = async () => {
  const res = await fetch("/api/stream/token", { cache: "no-store" });
  if (!res.ok) throw new Error("Could not get a Stream token");
  return (await res.json()).token as string;
};

/** Stream's prebuilt chat UI: channel list, messages, reactions, replies and threads. */
export function Messenger({
  apiKey,
  user,
  initialChannelId,
}: {
  apiKey: string;
  user: { id: string; name: string; image?: string };
  initialChannelId?: string;
}) {
  const client = useCreateChatClient({ apiKey, tokenOrProvider: tokenProvider, userData: user });

  if (!client) {
    return (
      <div className="grid h-[70vh] place-items-center rounded-2xl border bg-card">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Chat client={client} theme="str-chat__theme-dark">
      <div className="flex h-[75vh] flex-col overflow-hidden rounded-2xl border md:flex-row">
        <div className="max-h-56 border-b md:max-h-none md:w-80 md:border-b-0 md:border-r">
          <ChannelList
            filters={{ type: "messaging", members: { $in: [user.id] } }}
            sort={{ last_message_at: -1 }}
            options={{ state: true, watch: true, presence: true }}
            customActiveChannel={initialChannelId}
          />
        </div>
        <div className="min-h-0 flex-1">
          <Channel>
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageComposer />
            </Window>
            <Thread />
          </Channel>
        </div>
      </div>
    </Chat>
  );
}
