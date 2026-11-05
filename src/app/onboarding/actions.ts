"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db, profiles, trainerProfiles } from "@/db";
import { requireUser } from "@/lib/session";
import { upsertStreamUser } from "@/lib/stream";
import { slugify } from "@/lib/utils";
import { firstError, imageUrl, trainerProfileFromForm } from "@/lib/validation";

const clientSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(60),
  avatarUrl: imageUrl,
});

export async function completeOnboarding(formData: FormData) {
  const user = await requireUser();
  if (user.role) redirect(user.role === "trainer" ? "/trainer" : "/dashboard");

  const role = formData.get("role") === "trainer" ? "trainer" : "client";

  if (role === "client") {
    const parsed = clientSchema.safeParse({ name: formData.get("name"), avatarUrl: formData.get("avatarUrl") });
    if (!parsed.success) return { error: firstError(parsed.error) };
    await saveProfile(user, { role, ...parsed.data });
    await upsertStreamUser({ id: user.id, name: parsed.data.name, image: parsed.data.avatarUrl });
    redirect("/dashboard");
  }

  const parsed = trainerProfileFromForm(formData);
  if (!parsed.success) return { error: firstError(parsed.error) };
  const { name, avatarUrl, ...trainer } = parsed.data;

  await db.transaction(async (trx) => {
    await saveProfile(user, { role, name, avatarUrl }, trx);
    await trx
      .insert(trainerProfiles)
      .values({ userId: user.id, slug: slugify(name), ...trainer })
      .onConflictDoNothing();
  });
  await upsertStreamUser({ id: user.id, name, image: avatarUrl });
  redirect("/trainer");
}

async function saveProfile(
  user: { id: string; email: string },
  data: { role: "client" | "trainer"; name: string; avatarUrl?: string },
  trx: Pick<typeof db, "insert"> = db,
) {
  await trx
    .insert(profiles)
    .values({ id: user.id, email: user.email, ...data })
    .onConflictDoUpdate({ target: profiles.id, set: data });
}
