"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db, lessonProgress, lessons } from "@/db";
import { canWatchLesson } from "@/lib/access";
import { requireUser } from "@/lib/session";

export async function markLessonComplete(formData: FormData) {
  const user = await requireUser();
  const lessonId = z.uuid().parse(formData.get("lessonId"));

  const [lesson] = await db.select().from(lessons).where(eq(lessons.id, lessonId));
  if (!lesson || !(await canWatchLesson(user.id, lesson.id, lesson.programId))) {
    return { error: "You don't have access to this lesson." };
  }

  await db.insert(lessonProgress).values({ userId: user.id, lessonId }).onConflictDoNothing();
  revalidatePath("/programs/[slug]/lessons/[lessonId]", "page");
  return { ok: true };
}
