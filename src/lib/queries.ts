import "server-only";
import { and, asc, desc, eq, gt, ilike, isNull, lt, or, sql } from "drizzle-orm";
import { bookings, db, lessons, profiles, programs, slots, trainerProfiles } from "@/db";

const HOLD_MINUTES = 15;

export async function listTrainers({ q, specialty }: { q?: string; specialty?: string } = {}) {
  return db
    .select({
      id: profiles.id,
      name: profiles.name,
      avatarUrl: profiles.avatarUrl,
      slug: trainerProfiles.slug,
      headline: trainerProfiles.headline,
      specialties: trainerProfiles.specialties,
      coverUrl: trainerProfiles.coverUrl,
      programCount: sql<number>`(select count(*)::int from ${programs} where ${programs.trainerId} = ${profiles.id} and ${programs.published})`,
    })
    .from(trainerProfiles)
    .innerJoin(profiles, eq(profiles.id, trainerProfiles.userId))
    .where(
      and(
        q ? or(ilike(profiles.name, `%${q}%`), ilike(trainerProfiles.headline, `%${q}%`)) : undefined,
        specialty ? sql`${specialty} = any(${trainerProfiles.specialties})` : undefined,
      ),
    )
    .orderBy(desc(trainerProfiles.createdAt));
}
export type TrainerListItem = Awaited<ReturnType<typeof listTrainers>>[number];

export async function getTrainerBySlug(slug: string) {
  const [trainer] = await db
    .select({
      id: profiles.id,
      name: profiles.name,
      avatarUrl: profiles.avatarUrl,
      slug: trainerProfiles.slug,
      headline: trainerProfiles.headline,
      bio: trainerProfiles.bio,
      specialties: trainerProfiles.specialties,
      coverUrl: trainerProfiles.coverUrl,
    })
    .from(trainerProfiles)
    .innerJoin(profiles, eq(profiles.id, trainerProfiles.userId))
    .where(eq(trainerProfiles.slug, slug));
  return trainer ?? null;
}

export async function listPrograms({
  q,
  level,
  trainerId,
}: { q?: string; level?: string; trainerId?: string } = {}) {
  return db
    .select({
      id: programs.id,
      slug: programs.slug,
      title: programs.title,
      description: programs.description,
      level: programs.level,
      coverUrl: programs.coverUrl,
      trainerName: profiles.name,
      lessonCount: sql<number>`(select count(*)::int from ${lessons} where ${lessons.programId} = ${programs.id})`,
    })
    .from(programs)
    .innerJoin(profiles, eq(profiles.id, programs.trainerId))
    .where(
      and(
        eq(programs.published, true),
        q ? ilike(programs.title, `%${q}%`) : undefined,
        level ? eq(programs.level, level as "beginner") : undefined,
        trainerId ? eq(programs.trainerId, trainerId) : undefined,
      ),
    )
    .orderBy(desc(programs.createdAt));
}
export type ProgramListItem = Awaited<ReturnType<typeof listPrograms>>[number];

export async function getProgramBySlug(slug: string) {
  const [program] = await db
    .select({
      id: programs.id,
      slug: programs.slug,
      title: programs.title,
      description: programs.description,
      level: programs.level,
      coverUrl: programs.coverUrl,
      published: programs.published,
      trainerId: programs.trainerId,
      trainerName: profiles.name,
      trainerSlug: trainerProfiles.slug,
    })
    .from(programs)
    .innerJoin(profiles, eq(profiles.id, programs.trainerId))
    .leftJoin(trainerProfiles, eq(trainerProfiles.userId, programs.trainerId))
    .where(eq(programs.slug, slug));
  if (!program) return null;

  const lessonList = await db
    .select()
    .from(lessons)
    .where(eq(lessons.programId, program.id))
    .orderBy(asc(lessons.position));
  return { ...program, lessons: lessonList };
}

/** Future slots with no booking, or only an expired 15-minute hold. */
export async function listOpenSlots(trainerId: string) {
  const holdCutoff = new Date(Date.now() - HOLD_MINUTES * 60_000);
  return db
    .select({ id: slots.id, startsAt: slots.startsAt, durationMin: slots.durationMin, priceKobo: slots.priceKobo })
    .from(slots)
    .leftJoin(bookings, eq(bookings.slotId, slots.id))
    .where(
      and(
        eq(slots.trainerId, trainerId),
        gt(slots.startsAt, new Date()),
        or(isNull(bookings.id), and(eq(bookings.status, "pending"), lt(bookings.createdAt, holdCutoff))),
      ),
    )
    .orderBy(asc(slots.startsAt));
}

/** A trainer's own slots (incl. ones that started up to 2h ago) with booking state. */
export async function listTrainerSlots(trainerId: string) {
  const holdCutoff = Date.now() - HOLD_MINUTES * 60_000;
  const rows = await db
    .select({
      id: slots.id,
      startsAt: slots.startsAt,
      durationMin: slots.durationMin,
      priceKobo: slots.priceKobo,
      bookingId: bookings.id,
      bookingStatus: bookings.status,
      bookingCreatedAt: bookings.createdAt,
      clientName: profiles.name,
    })
    .from(slots)
    .leftJoin(bookings, eq(bookings.slotId, slots.id))
    .leftJoin(profiles, eq(profiles.id, bookings.clientId))
    .where(and(eq(slots.trainerId, trainerId), gt(slots.startsAt, new Date(Date.now() - 2 * 60 * 60_000))))
    .orderBy(asc(slots.startsAt));

  return rows.map((row) => ({
    ...row,
    state:
      row.bookingStatus === "paid"
        ? ("booked" as const)
        : row.bookingStatus === "pending" && row.bookingCreatedAt && row.bookingCreatedAt.getTime() > holdCutoff
          ? ("held" as const)
          : ("open" as const),
  }));
}

export { HOLD_MINUTES };
