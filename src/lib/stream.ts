import "server-only";
import { StreamClient } from "@stream-io/node-sdk";
import { env } from "@/lib/env";

let client: StreamClient | undefined;
function stream() {
  client ??= new StreamClient(env("NEXT_PUBLIC_STREAM_API_KEY"), env("STREAM_API_SECRET"));
  return client;
}

/** Works for both Stream Chat and Stream Video (same app). */
export function createUserToken(userId: string) {
  return stream().generateUserToken({ user_id: userId, validity_in_seconds: 60 * 60 });
}

export async function upsertStreamUser(user: { id: string; name: string; image?: string | null }) {
  await stream().upsertUsers([{ id: user.id, name: user.name, image: user.image ?? undefined }]);
}

/** A 1:1 messaging channel, distinct by its two members. Returns the channel id. */
export async function getOrCreateDirectChannel(meId: string, otherId: string) {
  const channel = stream().chat.channel("messaging");
  const res = await channel.getOrCreate({
    data: { created_by_id: meId, members: [{ user_id: meId }, { user_id: otherId }] },
  });
  return res.channel?.id;
}

/** The video call for a booked session. Only the client and trainer are members. */
export async function getOrCreateSessionCall(bookingId: string, clientId: string, trainerId: string) {
  await stream()
    .video.call("default", bookingId)
    .getOrCreate({
      data: {
        created_by_id: trainerId,
        members: [{ user_id: clientId }, { user_id: trainerId }],
      },
    });
}
