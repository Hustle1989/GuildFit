"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db, profiles, trainerProfiles } from "@/db";
import { requireTrainer } from "@/lib/session";
import { upsertStreamUser } from "@/lib/stream";
import { firstError, trainerProfileFromForm } from "@/lib/validation";

export async function updateTrainerProfile(formData: FormData) {
  const user = await requireTrainer();
  const parsed = trainerProfileFromForm(formData);
  if (!parsed.success) return { error: firstError(parsed.error) };
  const { name, avatarUrl, coverUrl, ...rest } = parsed.data;

  const [current] = await db.select().from(trainerProfiles).where(eq(trainerProfiles.userId, user.id));
  await db.transaction(async (trx) => {
    await trx
      .update(profiles)
      .set({ name, ...(avatarUrl && { avatarUrl }) })
      .where(eq(profiles.id, user.id));
    await trx
      .update(trainerProfiles)
      .set({ ...rest, ...(coverUrl && { coverUrl }) })
      .where(eq(trainerProfiles.userId, user.id));
  });
  await upsertStreamUser({ id: user.id, name, image: avatarUrl ?? user.image });

  if (current) revalidatePath(`/trainers/${current.slug}`);
  revalidatePath("/trainers");
  return { ok: true };
}
