"use server";

import { revalidatePath } from "next/cache";
import { and, eq, inArray, notInArray, sql } from "drizzle-orm";
import { z } from "zod";
import { bookings, db, lessons, profiles, programs, slots, trainerProfiles } from "@/db";
import { HOLD_MINUTES } from "@/lib/queries";
import { requireTrainer } from "@/lib/session";
import { uniqueSlug } from "@/lib/slugs";
import { GOAL_KEYS, LEVELS } from "@/lib/types";
import { readTrainerFields } from "@/lib/validation";

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

// ---------------------------------------------------------------------------
// Slots
// ---------------------------------------------------------------------------

const slotSchema = z.object({
  startsAt: z.iso.datetime({ offset: true }),
  durationMin: z.union([z.literal(30), z.literal(45), z.literal(60)]),
  priceNaira: z.number().int().min(1000, "Price must be at least ₦1,000.").max(1_000_000),
});

export async function addSlot(input: z.input<typeof slotSchema>): Promise<Result<{ slot: { id: string; startsAt: string; durationMin: number; priceKobo: number } }>> {
  const user = await requireTrainer();
  const parsed = slotSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const startsAt = new Date(parsed.data.startsAt);
  if (startsAt.getTime() < Date.now()) return { ok: false, error: "Pick a time in the future." };

  const [slot] = await db
    .insert(slots)
    .values({ trainerId: user.id, startsAt, durationMin: parsed.data.durationMin, priceKobo: parsed.data.priceNaira * 100 })
    .returning();
  revalidatePath("/trainer", "layout");
  return { ok: true, slot: { id: slot.id, startsAt: slot.startsAt.toISOString(), durationMin: slot.durationMin, priceKobo: slot.priceKobo } };
}

/** Deletes one of the trainer's slots, unless someone has paid for it or is checking out. */
export async function deleteSlot(slotId: string): Promise<Result> {
  const user = await requireTrainer();
  if (!/^[0-9a-f-]{36}$/i.test(slotId)) return { ok: false, error: "Unknown slot." };
  return db.transaction(async (tx) => {
    const [slot] = await tx.select().from(slots).where(and(eq(slots.id, slotId), eq(slots.trainerId, user.id))).for("update");
    if (!slot) return { ok: false, error: "Unknown slot." } as const;
    const [booking] = await tx.select().from(bookings).where(eq(bookings.slotId, slotId));
    const held = booking && booking.status === "pending" && booking.createdAt.getTime() > Date.now() - HOLD_MINUTES * 60_000;
    if (booking?.status === "paid" || held) return { ok: false, error: "This slot is booked, so it can't be deleted." } as const;
    await tx.delete(slots).where(eq(slots.id, slotId));
    revalidatePath("/trainer", "layout");
    return { ok: true } as const;
  });
}

// ---------------------------------------------------------------------------
// Programs
// ---------------------------------------------------------------------------

const programSchema = z.object({
  id: z.uuid().optional(),
  title: z.string().trim().min(3, "Give the program a title.").max(80),
  description: z.string().trim().max(2000),
  goal: z.enum(GOAL_KEYS),
  level: z.enum(LEVELS),
  weeks: z.coerce.number().int().min(1).max(52),
  published: z.boolean(),
  coverUrl: z.url().nullable().optional(),
  lessons: z
    .array(z.object({ id: z.string(), title: z.string().trim().min(1, "Every lesson needs a title.").max(120), durationMin: z.number().int().min(1).max(240) }))
    .max(100),
});

export type ProgramInput = z.input<typeof programSchema>;

/**
 * Creates or updates a program and its ordered lessons in one transaction.
 * Lessons keep their ids (and members' progress) when renamed or reordered.
 */
export async function saveProgram(input: ProgramInput): Promise<Result<{ id: string; slug: string }>> {
  const user = await requireTrainer();
  const parsed = programSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const data = parsed.data;
  if (data.published && data.lessons.length === 0) return { ok: false, error: "Add at least one lesson before publishing." };

  if (data.id) {
    const [owned] = await db.select({ id: programs.id }).from(programs).where(and(eq(programs.id, data.id), eq(programs.trainerId, user.id)));
    if (!owned) return { ok: false, error: "You can only edit your own programs." };
  }
  const slug = await uniqueSlug(data.title, "program", data.id);
  const fields = {
    slug,
    title: data.title,
    description: data.description,
    tagline: data.description.split(/[.!?]/)[0].slice(0, 120),
    goal: data.goal,
    level: data.level,
    weeks: data.weeks,
    published: data.published,
    ...(data.coverUrl !== undefined ? { coverUrl: data.coverUrl } : {}),
  };

  const id = await db.transaction(async (tx) => {
    const programId = data.id
      ? (await tx.update(programs).set(fields).where(eq(programs.id, data.id)).returning({ id: programs.id }))[0].id
      : (await tx.insert(programs).values({ ...fields, trainerId: user.id }).returning({ id: programs.id }))[0].id;

    const isUuid = (v: string) => /^[0-9a-f-]{36}$/i.test(v);
    const keepIds = data.lessons.map((l) => l.id).filter(isUuid);
    // Remove lessons that were deleted in the editor.
    await tx
      .delete(lessons)
      .where(and(eq(lessons.programId, programId), keepIds.length ? notInArray(lessons.id, keepIds) : undefined));
    // Park positions out of the way so the unique (program, position) index can't clash while reordering.
    if (keepIds.length) {
      await tx.update(lessons).set({ position: sql`-1 - ${lessons.position}` }).where(and(eq(lessons.programId, programId), inArray(lessons.id, keepIds)));
    }
    for (const [position, l] of data.lessons.entries()) {
      const values = { title: l.title, durationSec: l.durationMin * 60, position };
      const updated = isUuid(l.id)
        ? await tx.update(lessons).set(values).where(and(eq(lessons.id, l.id), eq(lessons.programId, programId))).returning({ id: lessons.id })
        : [];
      // New lessons keep the id the editor generated, so saving twice doesn't duplicate them.
      if (updated.length === 0) await tx.insert(lessons).values({ ...values, programId, ...(isUuid(l.id) ? { id: l.id } : {}) });
    }
    return programId;
  });

  revalidatePath("/trainer", "layout");
  revalidatePath("/programs", "layout");
  return { ok: true, id, slug };
}

// ---------------------------------------------------------------------------
// Profile
// ---------------------------------------------------------------------------

export type ProfileState = { ok?: boolean; error?: string };

export async function updateTrainerProfile(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const user = await requireTrainer();
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return { error: "Enter your display name." };
  const parsed = readTrainerFields(formData);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const t = parsed.data;

  await db.transaction(async (tx) => {
    await tx.update(profiles).set({ name }).where(eq(profiles.id, user.id));
    await tx
      .update(trainerProfiles)
      .set({ title: t.title, headline: t.headline, bio: t.bio, location: t.location, goals: t.goals, sessionPriceKobo: t.price * 100 })
      .where(eq(trainerProfiles.userId, user.id));
  });
  revalidatePath("/", "layout");
  return { ok: true };
}
