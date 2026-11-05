import "server-only";
import { and, asc, eq, gt } from "drizzle-orm";
import { db, lessons, memberships, programs } from "@/db";

export async function getMembership(userId: string) {
  const [membership] = await db.select().from(memberships).where(eq(memberships.userId, userId));
  return membership ?? null;
}

/**
 * Access lasts until the end of the paid period, whatever the status says.
 * A cancelled member keeps access until then; a failed renewal never extends it.
 */
export async function hasActiveMembership(userId: string) {
  const [row] = await db
    .select({ userId: memberships.userId })
    .from(memberships)
    .where(and(eq(memberships.userId, userId), gt(memberships.currentPeriodEnd, new Date())));
  return Boolean(row);
}

export async function previewLessonId(programId: string) {
  const [first] = await db
    .select({ id: lessons.id })
    .from(lessons)
    .where(eq(lessons.programId, programId))
    .orderBy(asc(lessons.position))
    .limit(1);
  return first?.id ?? null;
}

/** Free preview for everyone, own lessons for trainers, everything for members. */
export async function canWatchLesson(userId: string | null, lessonId: string, programId: string) {
  if ((await previewLessonId(programId)) === lessonId) return true;
  if (!userId) return false;

  const [program] = await db.select({ trainerId: programs.trainerId }).from(programs).where(eq(programs.id, programId));
  if (program?.trainerId === userId) return true;

  return hasActiveMembership(userId);
}
