import { z } from "zod";
import { SPECIALTIES } from "@/lib/utils";

/** Empty string -> undefined, so optional form fields validate cleanly. */
const optional = <T extends z.ZodType>(schema: T) =>
  z.preprocess((v) => (v === "" || v === null ? undefined : v), schema.optional());

/** Only accept image URLs from ImageKit (next/image is configured for it). */
export const imageUrl = optional(
  z.url().refine((u) => u.startsWith("https://ik.imagekit.io/"), "Image must be uploaded to ImageKit"),
);

export const trainerProfileSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(60),
  avatarUrl: imageUrl,
  headline: z.string().trim().min(5, "Add a short headline").max(120),
  bio: z.string().trim().min(20, "Bio should be at least 20 characters").max(2000),
  specialties: z.array(z.enum(SPECIALTIES)).min(1, "Pick at least one specialty"),
  coverUrl: imageUrl,
});

export function trainerProfileFromForm(formData: FormData) {
  return trainerProfileSchema.safeParse({
    name: formData.get("name"),
    avatarUrl: formData.get("avatarUrl"),
    headline: formData.get("headline"),
    bio: formData.get("bio"),
    specialties: formData.getAll("specialties"),
    coverUrl: formData.get("coverUrl"),
  });
}

export const firstError = (error: z.ZodError) => error.issues[0]?.message ?? "Invalid input";
