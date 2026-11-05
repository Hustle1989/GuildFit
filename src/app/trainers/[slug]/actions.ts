"use server";

import * as Sentry from "@sentry/nextjs";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { bookings, db, profiles, slots } from "@/db";
import { appUrl } from "@/lib/env";
import { initializeTransaction } from "@/lib/paystack";
import { HOLD_MINUTES } from "@/lib/queries";
import { requireProfile } from "@/lib/session";
import { getOrCreateDirectChannel, upsertStreamUser } from "@/lib/stream";

/** Hold the slot for 15 minutes, then send the client to Paystack checkout. */
export async function bookSlot(formData: FormData) {
  const user = await requireProfile();
  const slotId = z.uuid().safeParse(formData.get("slotId"));
  if (!slotId.success) return { error: "Invalid slot." };

  const reference = `gf_${crypto.randomUUID()}`;
  const holdCutoff = new Date(Date.now() - HOLD_MINUTES * 60_000);

  let booking: typeof bookings.$inferSelect;
  try {
    booking = await db.transaction(async (trx) => {
      const [slot] = await trx.select().from(slots).where(eq(slots.id, slotId.data)).for("update");
      if (!slot || slot.startsAt <= new Date()) throw new BookingError("This slot is no longer available.");
      if (slot.trainerId === user.id) throw new BookingError("You can't book your own slot.");

      const [existing] = await trx.select().from(bookings).where(eq(bookings.slotId, slot.id));
      if (existing) {
        const holdExpired = existing.status === "pending" && existing.createdAt < holdCutoff;
        const myHold = existing.status === "pending" && existing.clientId === user.id;
        if (existing.status === "paid" || (!holdExpired && !myHold)) {
          throw new BookingError("Someone else is booking this slot right now. Pick another one.");
        }
        await trx.delete(bookings).where(eq(bookings.id, existing.id));
      }

      const [created] = await trx
        .insert(bookings)
        .values({
          slotId: slot.id,
          clientId: user.id,
          trainerId: slot.trainerId,
          amountKobo: slot.priceKobo, // price always comes from the DB
          reference,
        })
        .returning();
      return created;
    });
  } catch (error) {
    if (error instanceof BookingError) return { error: error.message };
    Sentry.captureException(error, { tags: { flow: "booking" } });
    return { error: "Could not book this slot. Please try again." };
  }

  const checkout = await initializeTransaction({
    email: user.email,
    amountKobo: booking.amountKobo,
    reference: booking.reference,
    callbackUrl: `${appUrl()}/payments/callback`,
    metadata: { type: "session", bookingId: booking.id },
  });
  redirect(checkout.authorization_url);
}

class BookingError extends Error {}

/** Open (or reopen) the 1:1 Stream channel with a trainer. */
export async function startChat(formData: FormData) {
  const user = await requireProfile();
  const trainerId = z.string().min(1).parse(formData.get("trainerId"));
  if (trainerId === user.id) return { error: "That's you!" };

  const [trainer] = await db
    .select()
    .from(profiles)
    .where(and(eq(profiles.id, trainerId), eq(profiles.role, "trainer")));
  if (!trainer) return { error: "Trainer not found." };

  await upsertStreamUser({ id: user.id, name: user.name, image: user.image });
  await upsertStreamUser({ id: trainer.id, name: trainer.name, image: trainer.avatarUrl });
  const channelId = await getOrCreateDirectChannel(user.id, trainer.id);
  redirect(`/messages${channelId ? `?c=${channelId}` : ""}`);
}
