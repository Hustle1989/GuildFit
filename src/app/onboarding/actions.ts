"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db, profiles, trainerProfiles } from "@/db";
import { homeFor, requireUser } from "@/lib/session";
import { uniqueSlug } from "@/lib/slugs";
import { readTrainerFields } from "@/lib/validation";

export type OnboardingState = { error?: string };

const baseSchema = z.object({
  role: z.enum(["client", "trainer"], "Choose how you'll use GuildFit."),
  name: z.string().trim().min(2, "Enter your display name.").max(80),
});

/** Saves the role chosen at onboarding (once) and, for coaches, their public profile. */
export async function completeOnboarding(_prev: OnboardingState, formData: FormData): Promise<OnboardingState> {
  const user = await requireUser();
  if (user.role) redirect(homeFor(user.role));

  const base = baseSchema.safeParse({ role: formData.get("role"), name: formData.get("name") });
  if (!base.success) return { error: base.error.issues[0].message };
  const { role, name } = base.data;

  const trainer = role === "trainer" ? readTrainerFields(formData) : null;
  if (trainer && !trainer.success) return { error: trainer.error.issues[0].message };

  const slug = trainer ? await uniqueSlug(name, "trainer") : null;
  await db.transaction(async (tx) => {
    await tx
      .insert(profiles)
      .values({ id: user.id, email: user.email, name, avatarUrl: user.image, role })
      .onConflictDoUpdate({ target: profiles.id, set: { name, role } });
    if (trainer?.success && slug) {
      const t = trainer.data;
      await tx.insert(trainerProfiles).values({
        userId: user.id,
        slug,
        title: t.title,
        headline: t.headline,
        bio: t.bio,
        location: t.location,
        goals: t.goals,
        sessionPriceKobo: t.price * 100,
        photoUrl: user.image,
      });
    }
  });
  redirect(homeFor(role));
}
