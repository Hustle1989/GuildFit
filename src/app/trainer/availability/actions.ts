"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { bookings, db, slots, trainerProfiles } from "@/db";
import { requireTrainer } from "@/lib/session";
import { firstError } from "@/lib/validation";

const slotSchema = z.object({
  startsAt: z.coerce.date().refine((d) => d.getTime() > Date.now(), "Pick a time in the future"),
  durationMin: z.coerce.number().pipe(z.union([z.literal(30), z.literal(45), z.literal(60)])),
  priceNaira: z.coerce.number().int().min(1000, "Minimum price is ₦1,000").max(1_000_000),
});

async function revalidateTrainer(trainerId: string) {
  revalidatePath("/trainer/availability");
  const [tp] = await db.select({ slug: trainerProfiles.slug }).from(trainerProfiles).where(eq(trainerProfiles.userId, trainerId));
  if (tp) revalidatePath(`/trainers/${tp.slug}`);
}

export async function createSlot(formData: FormData) {
  const user = await requireTrainer();
  const parsed = slotSchema.safeParse({
    startsAt: formData.get("startsAt"), // ISO string in UTC, converted in the browser
    durationMin: formData.get("durationMin"),
    priceNaira: formData.get("priceNaira"),
  });
  if (!parsed.success) return { error: firstError(parsed.error) };

  const { startsAt, durationMin, priceNaira } = parsed.data;
  await db.insert(slots).values({ trainerId: user.id, startsAt, durationMin, priceKobo: priceNaira * 100 });
  await revalidateTrainer(user.id);
  return { ok: true };
}

export async function deleteSlot(formData: FormData) {
  const user = await requireTrainer();
  const slotId = z.uuid().parse(formData.get("slotId"));

  const [booking] = await db.select({ id: bookings.id }).from(bookings).where(eq(bookings.slotId, slotId));
  if (booking) return { error: "This slot has a booking and can't be deleted." };

  await db.delete(slots).where(and(eq(slots.id, slotId), eq(slots.trainerId, user.id)));
  await revalidateTrainer(user.id);
  return { ok: true };
}
