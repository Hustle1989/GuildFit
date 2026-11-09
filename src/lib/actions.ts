"use server";

/**
 * Member-facing mutations. Paystack isn't wired yet, so "checkout" completes
 * immediately: the rows written here are exactly what the Paystack callback and
 * webhook will write later (see PLAN.md chapters 6 and 7).
 */
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { bookings, db, earnings, enrollments, lessonProgress, lessons, memberships, programs, slots } from "@/db";
import { getMembership, HOLD_MINUTES, isMembershipActive } from "@/lib/queries";
import { requireProfile } from "@/lib/session";
import { PLATFORM_FEE_PERCENT } from "@/lib/utils";

const isUuid = (v: unknown): v is string => typeof v === "string" && /^[0-9a-f-]{36}$/i.test(v);

// ---------- membership ----------

export async function subscribeMembership() {
  const user = await requireProfile();
  const current = await getMembership(user.id);
  // Extend from the later of now and the current period end.
  const from = isMembershipActive(current) ? current!.currentPeriodEnd : new Date();
  const periodEnd = new Date(from);
  periodEnd.setMonth(periodEnd.getMonth() + 1);
  await db
    .insert(memberships)
    .values({ userId: user.id, status: "active", currentPeriodEnd: periodEnd })
    .onConflictDoUpdate({ target: memberships.userId, set: { status: "active", currentPeriodEnd: periodEnd } });
  revalidatePath("/", "layout");
  redirect("/payments/callback?type=membership");
}

/** Stops renewal; access continues until the paid month ends. */
export async function cancelMembership() {
  const user = await requireProfile();
  await db.update(memberships).set({ status: "non_renewing" }).where(eq(memberships.userId, user.id));
  revalidatePath("/billing");
}

export async function resumeMembership() {
  const user = await requireProfile();
  await db.update(memberships).set({ status: "active" }).where(eq(memberships.userId, user.id));
  revalidatePath("/billing");
}

// ---------- 1:1 sessions ----------

export type BookingResult = { error?: string };

/**
 * Books a slot. One transaction locks the slot row, refuses it if it's paid or
 * held by someone else's checkout, then records the paid booking and the
 * trainer's earnings (90% net). The amount always comes from the database.
 */
export async function bookSlot(_prev: BookingResult, formData: FormData): Promise<BookingResult> {
  const user = await requireProfile();
  const slotId = formData.get("slotId");
  if (!isUuid(slotId)) return { error: "Pick a time first." };

  const result = await db.transaction(async (tx) => {
    const [slot] = await tx.select().from(slots).where(eq(slots.id, slotId)).for("update");
    if (!slot) return { error: "That slot no longer exists." };
    if (slot.trainerId === user.id) return { error: "You can't book your own slot." };
    if (slot.startsAt.getTime() < Date.now()) return { error: "That time has already passed." };

    const [existing] = await tx.select().from(bookings).where(eq(bookings.slotId, slot.id));
    if (existing) {
      const heldByOther = existing.status === "pending" && existing.createdAt.getTime() > Date.now() - HOLD_MINUTES * 60_000 && existing.clientId !== user.id;
      if (existing.status === "paid" || heldByOther) return { error: "Someone just booked that time. Please pick another." };
      await tx.delete(bookings).where(eq(bookings.id, existing.id)); // stale hold
    }

    const id = crypto.randomUUID();
    const paidAt = new Date();
    await tx.insert(bookings).values({
      id,
      slotId: slot.id,
      clientId: user.id,
      trainerId: slot.trainerId,
      amountKobo: slot.priceKobo,
      status: "paid",
      reference: `gf_${id}`,
      paidAt,
    });
    const fee = Math.round((slot.priceKobo * PLATFORM_FEE_PERCENT) / 100);
    await tx.insert(earnings).values({ trainerId: slot.trainerId, bookingId: id, grossKobo: slot.priceKobo, feeKobo: fee, netKobo: slot.priceKobo - fee, createdAt: paidAt });
    return { bookingId: id };
  });

  if ("error" in result) return { error: result.error };
  revalidatePath("/sessions");
  redirect(`/payments/callback?type=session&booking=${result.bookingId}`);
}

// ---------- lesson progress ----------

/** Marks a lesson done (or not done) and enrolls the user in its program. */
export async function setLessonComplete(lessonId: string, done: boolean) {
  const user = await requireProfile();
  if (!isUuid(lessonId)) return;
  const [lesson] = await db
    .select({ programId: lessons.programId, slug: programs.slug })
    .from(lessons)
    .innerJoin(programs, eq(programs.id, lessons.programId))
    .where(eq(lessons.id, lessonId));
  if (!lesson) return;

  await db.insert(enrollments).values({ userId: user.id, programId: lesson.programId }).onConflictDoNothing();
  if (done) {
    await db.insert(lessonProgress).values({ userId: user.id, lessonId }).onConflictDoNothing();
  } else {
    await db.delete(lessonProgress).where(and(eq(lessonProgress.userId, user.id), eq(lessonProgress.lessonId, lessonId)));
  }
  revalidatePath(`/programs/${lesson.slug}`, "layout");
  revalidatePath("/dashboard");
}

/** Records that a member started a program (first lesson opened). */
export async function enrollInProgram(programId: string) {
  const user = await requireProfile();
  if (!isUuid(programId)) return;
  await db.insert(enrollments).values({ userId: user.id, programId }).onConflictDoNothing();
}

