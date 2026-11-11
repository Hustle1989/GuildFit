import { z } from "zod";
import { GOAL_KEYS } from "@/lib/types";

/** Coach profile fields (onboarding and /trainer/profile). */
export const trainerSchema = z.object({
  title: z.string().trim().min(2, "Add a specialty title, e.g. Strength & Muscle.").max(60),
  headline: z.string().trim().min(5, "Add a one-line headline.").max(120),
  bio: z.string().trim().min(20, "Tell clients a bit more about you (20+ characters).").max(2000),
  location: z.string().trim().max(60).default(""),
  price: z.coerce.number().int().min(1000, "Session price must be at least ₦1,000.").max(1_000_000),
  goals: z.array(z.enum(GOAL_KEYS)).max(GOAL_KEYS.length),
});

export function readTrainerFields(formData: FormData) {
  return trainerSchema.safeParse({
    title: formData.get("title"),
    headline: formData.get("headline"),
    bio: formData.get("bio"),
    location: formData.get("location") ?? "",
    price: formData.get("price"),
    goals: formData.getAll("goals"),
  });
}
