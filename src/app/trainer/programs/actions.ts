"use server";

import { and, asc, desc, eq, gt, lt, max } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db, lessons, programs } from "@/db";
import { requireTrainer } from "@/lib/session";
import { slugify } from "@/lib/utils";
import { firstError, imageUrl } from "@/lib/validation";

const programSchema = z.object({
  title: z.string().trim().min(3, "Title is too short").max(80),
  description: z.string().trim().min(20, "Description should be at least 20 characters").max(3000),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  coverUrl: imageUrl,
});

const programFromForm = (formData: FormData) =>
  programSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    level: formData.get("level"),
    coverUrl: formData.get("coverUrl"),
  });

/** Load a program only if the signed-in trainer owns it. */
async function ownProgram(programId: unknown) {
  const user = await requireTrainer();
  const id = z.uuid().parse(programId);
  const [program] = await db
    .select()
    .from(programs)
    .where(and(eq(programs.id, id), eq(programs.trainerId, user.id)));
  if (!program) throw new Error("Program not found");
  return program;
}

function refresh(program: { id: string; slug: string }) {
  revalidatePath(`/trainer/programs/${program.id}`);
  revalidatePath(`/programs/${program.slug}`);
  revalidatePath("/programs");
}

export async function createProgram(formData: FormData) {
  const user = await requireTrainer();
  const parsed = programFromForm(formData);
  if (!parsed.success) return { error: firstError(parsed.error) };

  const [program] = await db
    .insert(programs)
    .values({ ...parsed.data, trainerId: user.id, slug: slugify(parsed.data.title) })
    .returning();
  redirect(`/trainer/programs/${program.id}`);
}

export async function updateProgram(formData: FormData) {
  const program = await ownProgram(formData.get("programId"));
  const parsed = programFromForm(formData);
  if (!parsed.success) return { error: firstError(parsed.error) };

  await db
    .update(programs)
    .set({ ...parsed.data, coverUrl: parsed.data.coverUrl ?? program.coverUrl })
    .where(eq(programs.id, program.id));
  refresh(program);
  return { ok: true };
}

export async function togglePublish(formData: FormData) {
  const program = await ownProgram(formData.get("programId"));
  if (!program.published) {
    const [first] = await db.select({ id: lessons.id }).from(lessons).where(eq(lessons.programId, program.id)).limit(1);
    if (!first) return { error: "Add at least one lesson before publishing." };
  }
  await db.update(programs).set({ published: !program.published }).where(eq(programs.id, program.id));
  refresh(program);
  return { ok: true };
}

const lessonSchema = z.object({
  title: z.string().trim().min(2, "Lesson title is too short").max(100),
  notes: z.string().trim().max(3000).default(""),
  videoPath: z.string().startsWith("/", "Upload a video first"),
  durationSec: z.coerce.number().int().positive().optional().catch(undefined),
});

export async function addLesson(formData: FormData) {
  const program = await ownProgram(formData.get("programId"));
  const parsed = lessonSchema.safeParse({
    title: formData.get("title"),
    notes: formData.get("notes") ?? "",
    videoPath: formData.get("videoPath"),
    durationSec: formData.get("videoPathDuration"),
  });
  if (!parsed.success) return { error: firstError(parsed.error) };

  const [{ last }] = await db.select({ last: max(lessons.position) }).from(lessons).where(eq(lessons.programId, program.id));
  await db.insert(lessons).values({ ...parsed.data, programId: program.id, position: (last ?? 0) + 1 });
  refresh(program);
  return { ok: true };
}

export async function deleteLesson(formData: FormData) {
  const program = await ownProgram(formData.get("programId"));
  const lessonId = z.uuid().parse(formData.get("lessonId"));
  await db.delete(lessons).where(and(eq(lessons.id, lessonId), eq(lessons.programId, program.id)));
  refresh(program);
  return { ok: true };
}

/** Swap a lesson with its neighbour (up or down). */
export async function moveLesson(formData: FormData) {
  const program = await ownProgram(formData.get("programId"));
  const lessonId = z.uuid().parse(formData.get("lessonId"));
  const direction = formData.get("direction") === "up" ? "up" : "down";

  await db.transaction(async (trx) => {
    const [lesson] = await trx
      .select()
      .from(lessons)
      .where(and(eq(lessons.id, lessonId), eq(lessons.programId, program.id)));
    if (!lesson) return;

    const [neighbour] = await trx
      .select()
      .from(lessons)
      .where(
        and(
          eq(lessons.programId, program.id),
          direction === "up" ? lt(lessons.position, lesson.position) : gt(lessons.position, lesson.position),
        ),
      )
      .orderBy(direction === "up" ? desc(lessons.position) : asc(lessons.position))
      .limit(1);
    if (!neighbour) return;

    // Park at -1 first so the (program_id, position) unique constraint never clashes.
    await trx.update(lessons).set({ position: -1 }).where(eq(lessons.id, lesson.id));
    await trx.update(lessons).set({ position: lesson.position }).where(eq(lessons.id, neighbour.id));
    await trx.update(lessons).set({ position: neighbour.position }).where(eq(lessons.id, lesson.id));
  });
  refresh(program);
  return { ok: true };
}
