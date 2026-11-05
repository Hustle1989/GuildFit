"use client";

import { useEffect, useState } from "react";
import {
  CallControls,
  CallingState,
  SpeakerLayout,
  StreamCall,
  StreamTheme,
  StreamVideo,
  StreamVideoClient,
  useCallStateHooks,
  type Call,
} from "@stream-io/video-react-sdk";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import "@stream-io/video-react-sdk/dist/css/styles.css";

const tokenProvider = async () => {
  const res = await fetch("/api/stream/token", { cache: "no-store" });
  if (!res.ok) throw new Error("Could not get a Stream token");
  return (await res.json()).token as string;
};

/** Joins the Stream video call for a booking (call id = booking id). */
export function SessionCall({
  callId,
  apiKey,
  user,
}: {
  callId: string;
  apiKey: string;
  user: { id: string; name: string; image?: string };
}) {
  const [stream, setStream] = useState<{ client: StreamVideoClient; call: Call } | null>(null);
  const [joined, setJoined] = useState(false);

  const { id, name, image } = user;
  useEffect(() => {
    // The client must live in the browser and be torn down on unmount, so it's
    // created in an effect (Stream's recommended pattern).
    const client = StreamVideoClient.getOrCreateInstance({ apiKey, user: { id, name, image }, tokenProvider });
    const call = client.call("default", callId);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing with an external system
    setStream({ client, call });
    return () => {
      call.leave().catch(() => {});
      client.disconnectUser().catch(() => {});
    };
  }, [apiKey, callId, id, name, image]);

  if (!stream) return <Loading />;
  const { client, call } = stream;

  return (
    <StreamVideo client={client}>
      <StreamTheme>
        <StreamCall call={call}>
          {joined ? (
            <CallUI onLeave={() => setJoined(false)} />
          ) : (
            <div className="rounded-2xl border bg-card p-10 text-center">
              <p className="mb-4 text-muted-foreground">Camera and mic will be requested when you join.</p>
              <Button size="lg" onClick={() => call.join().then(() => setJoined(true))}>
                Join call
              </Button>
            </div>
          )}
        </StreamCall>
      </StreamTheme>
    </StreamVideo>
  );
}

function CallUI({ onLeave }: { onLeave: () => void }) {
  const { useCallCallingState } = useCallStateHooks();
  if (useCallCallingState() !== CallingState.JOINED) return <Loading />;
  return (
    <div className="overflow-hidden rounded-2xl border bg-black p-2">
      <SpeakerLayout participantsBarPosition="bottom" />
      <CallControls onLeave={onLeave} />
    </div>
  );
}

function Loading() {
  return (
    <div className="grid h-64 place-items-center rounded-2xl border bg-card">
      <Loader2 className="animate-spin text-primary" />
    </div>
  );
}
