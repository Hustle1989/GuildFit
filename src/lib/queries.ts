import "server-only";
import { and, asc, desc, eq, gt, gte, ilike, inArray, or, sql, type SQL } from "drizzle-orm";
import {
  bookings,
  db,
  earnings,
  enrollments,
  lessonProgress,
  lessons,
  memberships,
  profiles,
  programs,
  slots,
  trainerProfiles,
} from "@/db";
import {
  DEFAULT_PROGRAM_IMAGE,
  DEFAULT_TRAINER_IMAGE,
  isGoal,
  type GoalKey,
  type Level,
  type Program,
  type Trainer,
} from "@/lib/types";

/** A pending (unpaid) booking holds its slot for this long during checkout. */
export const HOLD_MINUTES = 15;
const holdCutoff = () => new Date(Date.now() - HOLD_MINUTES * 60_000);
const like = (q: string) => `%${q.replace(/[\\%_]/g, (c) => `\\${c}`)}%`;

// ---------------------------------------------------------------------------
// Trainers
// ---------------------------------------------------------------------------

const trainerColumns = {
  id: profiles.id,
  name: profiles.name,
  avatarUrl: profiles.avatarUrl,
  tp: trainerProfiles,
};

function toTrainer(row: { id: string; name: string; avatarUrl: string | null; tp: typeof trainerProfiles.$inferSelect }): Trainer {
  const { tp } = row;
  return {
    id: row.id,
    slug: tp.slug,
    name: row.name,
    title: tp.title,
    headline: tp.headline,
    bio: tp.bio,
    goals: tp.goals.filter(isGoal),
    image: tp.photoUrl ?? row.avatarUrl ?? DEFAULT_TRAINER_IMAGE,
    location: tp.location,
    yearsExperience: tp.yearsExperience,
    clients: tp.clientsCoached,
    sessionPriceKobo: tp.sessionPriceKobo,
    certifications: tp.certifications,
  };
}

export async function listTrainers({ q, goal }: { q?: string; goal?: GoalKey } = {}) {
  const search = q?.trim();
  const rows = await db
    .select(trainerColumns)
    .from(trainerProfiles)
    .innerJoin(profiles, eq(profiles.id, trainerProfiles.userId))
    .where(
      and(
        goal ? sql`${goal} = any(${trainerProfiles.goals})` : undefined,
        search
          ? or(
              ilike(profiles.name, like(search)),
              ilike(trainerProfiles.title, like(search)),
              ilike(trainerProfiles.headline, like(search)),
              ilike(trainerProfiles.location, like(search)),
            )
          : undefined,
      ),
    )
    .orderBy(asc(trainerProfiles.createdAt), asc(profiles.name));
  return rows.map(toTrainer);
}

export async function getTrainerBySlug(slug: string) {
  const [row] = await db
    .select(trainerColumns)
    .from(trainerProfiles)
    .innerJoin(profiles, eq(profiles.id, trainerProfiles.userId))
    .where(eq(trainerProfiles.slug, slug));
  return row ? toTrainer(row) : null;
}

export async function getTrainerById(userId: string) {
  const [row] = await db
    .select(trainerColumns)
    .from(trainerProfiles)
    .innerJoin(profiles, eq(profiles.id, trainerProfiles.userId))
    .where(eq(trainerProfiles.userId, userId));
  return row ? toTrainer(row) : null;
}

/**
 * A trainer's upcoming slots for the public booking grid. `taken` is true when
 * someone has paid or is checking out right now; who booked is never exposed.
 */
export async function listBookableSlots(trainerId: string) {
  const rows = await db
    .select({
      id: slots.id,
      startsAt: slots.startsAt,
      durationMin: slots.durationMin,
      priceKobo: slots.priceKobo,
      bookingStatus: bookings.status,
      bookingCreatedAt: bookings.createdAt,
    })
    .from(slots)
    .leftJoin(bookings, eq(bookings.slotId, slots.id))
    .where(and(eq(slots.trainerId, trainerId), gt(slots.startsAt, new Date())))
    .orderBy(asc(slots.startsAt))
    .limit(60);
  const cutoff = holdCutoff().getTime();
  return rows.map(({ bookingStatus, bookingCreatedAt, ...slot }) => ({
    ...slot,
    taken: bookingStatus === "paid" || (bookingStatus === "pending" && bookingCreatedAt!.getTime() > cutoff),
  }));
}

// ---------------------------------------------------------------------------
// Programs
// ---------------------------------------------------------------------------

async function loadPrograms(where: SQL | undefined, order: "newest" | "popular" = "newest") {
  const enrolledCount = sql<number>`(select count(*)::int from ${enrollments} where ${enrollments.programId} = ${programs.id})`;
  const rows = await db
    .select({
      program: programs,
      trainerName: profiles.name,
      trainerAvatar: profiles.avatarUrl,
      trainerPhoto: trainerProfiles.photoUrl,
      trainerSlug: trainerProfiles.slug,
      trainerTitle: trainerProfiles.title,
      enrolled: enrolledCount,
    })
    .from(programs)
    .innerJoin(profiles, eq(profiles.id, programs.trainerId))
    .leftJoin(trainerProfiles, eq(trainerProfiles.userId, programs.trainerId))
    .where(where)
    .orderBy(order === "popular" ? desc(enrolledCount) : asc(programs.createdAt), asc(programs.title));

  const ids = rows.map((r) => r.program.id);
  const lessonRows = ids.length
    ? await db.select().from(lessons).where(inArray(lessons.programId, ids)).orderBy(asc(lessons.position))
    : [];

  return rows.map(({ program: p, ...r }): Program => ({
    id: p.id,
    slug: p.slug,
    trainerId: p.trainerId,
    trainer: r.trainerSlug
      ? { name: r.trainerName, image: r.trainerPhoto ?? r.trainerAvatar ?? DEFAULT_TRAINER_IMAGE, slug: r.trainerSlug, title: r.trainerTitle ?? "Coach" }
      : null,
    title: p.title,
    tagline: p.tagline,
    description: p.description,
    goal: isGoal(p.goal) ? p.goal : "strength",
    level: p.level,
    weeks: p.weeks,
    image: p.coverUrl ?? DEFAULT_PROGRAM_IMAGE,
    published: p.published,
    enrolled: r.enrolled,
    outcomes: p.outcomes,
    lessons: lessonRows
      .filter((l) => l.programId === p.id)
      .map((l) => ({ id: l.id, title: l.title, durationMin: Math.max(1, Math.round(l.durationSec / 60)), notes: l.notes })),
  }));
}

export async function listPrograms({ q, goal, level, limit }: { q?: string; goal?: GoalKey; level?: Level; limit?: number } = {}) {
  const search = q?.trim();
  const list = await loadPrograms(
    and(
      eq(programs.published, true),
      goal ? eq(programs.goal, goal) : undefined,
      level ? eq(programs.level, level) : undefined,
      search ? or(ilike(programs.title, like(search)), ilike(programs.tagline, like(search)), ilike(profiles.name, like(search))) : undefined,
    ),
    limit ? "popular" : "newest",
  );
  return limit ? list.slice(0, limit) : list;
}

export async function listProgramsByTrainer(trainerId: string, { includeDrafts = false } = {}) {
  return loadPrograms(and(eq(programs.trainerId, trainerId), includeDrafts ? undefined : eq(programs.published, true)));
}

export async function getProgramBySlug(slug: string) {
  const [program] = await loadPrograms(eq(programs.slug, slug));
  return program ?? null;
}

/** A program as its owner sees it (drafts included). */
export async function getOwnedProgram(id: string, trainerId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [program] = await loadPrograms(and(eq(programs.id, id), eq(programs.trainerId, trainerId)));
  return program ?? null;
}

// ---------------------------------------------------------------------------
// Membership & lesson access
// ---------------------------------------------------------------------------

export async function getMembership(userId: string) {
  const [row] = await db.select().from(memberships).where(eq(memberships.userId, userId));
  return row ?? null;
}

/** Access lasts until the paid period ends, even after cancelling. */
export const isMembershipActive = (m: { currentPeriodEnd: Date } | null) => !!m && m.currentPeriodEnd.getTime() > Date.now();

export async function getCompletedLessonIds(userId: string, programId?: string) {
  const rows = await db
    .select({ lessonId: lessonProgress.lessonId })
    .from(lessonProgress)
    .innerJoin(lessons, eq(lessons.id, lessonProgress.lessonId))
    .where(and(eq(lessonProgress.userId, userId), programId ? eq(lessons.programId, programId) : undefined));
  return new Set(rows.map((r) => r.lessonId));
}

// ---------------------------------------------------------------------------
// Client: library, sessions, billing
// ---------------------------------------------------------------------------

export async function getLibrary(userId: string) {
  const rows = await db.select({ programId: enrollments.programId }).from(enrollments).where(eq(enrollments.userId, userId)).orderBy(asc(enrollments.createdAt));
  if (rows.length === 0) return [];
  const list = await loadPrograms(inArray(programs.id, rows.map((r) => r.programId)));
  const done = await getCompletedLessonIds(userId);
  return list.map((program) => ({ program, completed: program.lessons.filter((l) => done.has(l.id)).length }));
}

const sessionColumns = {
  id: bookings.id,
  reference: bookings.reference,
  startsAt: slots.startsAt,
  durationMin: slots.durationMin,
  amountKobo: bookings.amountKobo,
  paidAt: bookings.paidAt,
  trainerId: bookings.trainerId,
  clientId: bookings.clientId,
};

/** A client's paid sessions, soonest first, with the coach's details. */
export async function listClientSessions(userId: string) {
  const rows = await db
    .select({ ...sessionColumns, trainerName: profiles.name, trainerAvatar: profiles.avatarUrl, trainerPhoto: trainerProfiles.photoUrl, trainerSlug: trainerProfiles.slug })
    .from(bookings)
    .innerJoin(slots, eq(slots.id, bookings.slotId))
    .innerJoin(profiles, eq(profiles.id, bookings.trainerId))
    .leftJoin(trainerProfiles, eq(trainerProfiles.userId, bookings.trainerId))
    .where(and(eq(bookings.clientId, userId), eq(bookings.status, "paid")))
    .orderBy(asc(slots.startsAt));
  return rows.map((r) => ({ ...r, trainer: { name: r.trainerName, image: r.trainerPhoto ?? r.trainerAvatar ?? DEFAULT_TRAINER_IMAGE, slug: r.trainerSlug } }));
}

/** One paid session, if `userId` is its client or its trainer. */
export async function getSessionForUser(bookingId: string, userId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(bookingId)) return null;
  const [row] = await db
    .select(sessionColumns)
    .from(bookings)
    .innerJoin(slots, eq(slots.id, bookings.slotId))
    .where(and(eq(bookings.id, bookingId), eq(bookings.status, "paid"), or(eq(bookings.clientId, userId), eq(bookings.trainerId, userId))));
  if (!row) return null;
  const people = await db.select({ id: profiles.id, name: profiles.name, avatarUrl: profiles.avatarUrl }).from(profiles).where(inArray(profiles.id, [row.clientId, row.trainerId]));
  const byId = Object.fromEntries(people.map((p) => [p.id, p]));
  return { ...row, client: byId[row.clientId], trainer: byId[row.trainerId] };
}

export async function listPayments(userId: string) {
  const sessions = await listClientSessions(userId);
  const membership = await getMembership(userId);
  const rows = sessions.map((s) => ({
    id: s.id,
    date: s.paidAt ?? s.startsAt,
    description: `1:1 session · ${s.trainer.name}`,
    amountKobo: s.amountKobo,
  }));
  if (membership) {
    // Monthly charges since the membership started (Paystack invoices later).
    for (let d = new Date(membership.createdAt); d.getTime() <= Date.now(); d = new Date(d.getFullYear(), d.getMonth() + 1, d.getDate(), d.getHours())) {
      rows.push({ id: `m-${d.toISOString()}`, date: d, description: "GuildFit Monthly", amountKobo: 500_000 });
    }
  }
  return rows.sort((a, b) => b.date.getTime() - a.date.getTime());
}

// ---------------------------------------------------------------------------
// Trainer studio
// ---------------------------------------------------------------------------

export type SlotStatus = "open" | "held" | "booked";

/** The trainer's slots from 2 hours ago onwards, with who booked or is holding each one. */
export async function listTrainerSlots(trainerId: string) {
  const rows = await db
    .select({
      id: slots.id,
      startsAt: slots.startsAt,
      durationMin: slots.durationMin,
      priceKobo: slots.priceKobo,
      bookingId: bookings.id,
      bookingStatus: bookings.status,
      bookingCreatedAt: bookings.createdAt,
      clientId: bookings.clientId,
      clientName: profiles.name,
    })
    .from(slots)
    .leftJoin(bookings, eq(bookings.slotId, slots.id))
    .leftJoin(profiles, eq(profiles.id, bookings.clientId))
    .where(and(eq(slots.trainerId, trainerId), gte(slots.startsAt, new Date(Date.now() - 2 * 60 * 60_000))))
    .orderBy(asc(slots.startsAt));
  const cutoff = holdCutoff().getTime();
  return rows.map((r) => {
    const status: SlotStatus =
      r.bookingStatus === "paid" ? "booked" : r.bookingStatus === "pending" && r.bookingCreatedAt!.getTime() > cutoff ? "held" : "open";
    return {
      id: r.id,
      startsAt: r.startsAt,
      durationMin: r.durationMin,
      priceKobo: r.priceKobo,
      status,
      bookingId: status === "open" ? null : r.bookingId,
      client: status === "open" || !r.clientName ? null : { id: r.clientId!, name: r.clientName },
    };
  });
}

/** Monday 00:00 UTC of the week containing `d` (matches Postgres date_trunc('week')). */
function weekStart(d: Date) {
  const day = (d.getUTCDay() + 6) % 7;
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - day));
}

/** Net earnings per week for the last `weeks` weeks, oldest first. */
export async function getWeeklyEarnings(trainerId: string, weeks = 8) {
  const first = weekStart(new Date(Date.now() - (weeks - 1) * 7 * 24 * 60 * 60_000));
  const rows = await db
    .select({ week: sql<string>`date_trunc('week', ${earnings.createdAt})`.as("week"), net: sql<number>`sum(${earnings.netKobo})::int` })
    .from(earnings)
    .where(and(eq(earnings.trainerId, trainerId), gte(earnings.createdAt, first)))
    .groupBy(sql`1`);
  const byWeek = new Map(rows.map((r) => [weekStart(new Date(r.week)).getTime(), r.net]));
  return Array.from({ length: weeks }, (_, i) => {
    const start = new Date(first.getTime() + i * 7 * 24 * 60 * 60_000);
    return { weekStart: start, netKobo: byWeek.get(start.getTime()) ?? 0 };
  });
}

export async function getLedger(trainerId: string, limit = 50) {
  return db
    .select({
      id: earnings.id,
      date: earnings.createdAt,
      grossKobo: earnings.grossKobo,
      feeKobo: earnings.feeKobo,
      netKobo: earnings.netKobo,
      clientName: profiles.name,
      clientAvatar: profiles.avatarUrl,
    })
    .from(earnings)
    .innerJoin(bookings, eq(bookings.id, earnings.bookingId))
    .innerJoin(profiles, eq(profiles.id, bookings.clientId))
    .where(eq(earnings.trainerId, trainerId))
    .orderBy(desc(earnings.createdAt))
    .limit(limit);
}

export async function getEarningsTotals(trainerId: string, sinceDays = 30) {
  const [row] = await db
    .select({
      gross: sql<number>`coalesce(sum(${earnings.grossKobo}), 0)::int`,
      fee: sql<number>`coalesce(sum(${earnings.feeKobo}), 0)::int`,
      net: sql<number>`coalesce(sum(${earnings.netKobo}), 0)::int`,
      count: sql<number>`count(*)::int`,
    })
    .from(earnings)
    .where(and(eq(earnings.trainerId, trainerId), gte(earnings.createdAt, new Date(Date.now() - sinceDays * 24 * 60 * 60_000))));
  return row;
}

/** Everyone who paid for a session with the trainer or enrolled in one of their programs. */
export async function listTrainerClients(trainerId: string) {
  const sessionRows = await db
    .select({ clientId: bookings.clientId, sessions: sql<number>`count(*)::int`, last: sql<Date>`max(${bookings.paidAt})` })
    .from(bookings)
    .where(and(eq(bookings.trainerId, trainerId), eq(bookings.status, "paid")))
    .groupBy(bookings.clientId);
  const programRows = await db
    .select({ clientId: enrollments.userId, programs: sql<number>`count(*)::int`, last: sql<Date>`max(${enrollments.createdAt})` })
    .from(enrollments)
    .innerJoin(programs, eq(programs.id, enrollments.programId))
    .where(eq(programs.trainerId, trainerId))
    .groupBy(enrollments.userId);

  const ids = [...new Set([...sessionRows, ...programRows].map((r) => r.clientId))];
  if (ids.length === 0) return [];
  const people = await db.select({ id: profiles.id, name: profiles.name, email: profiles.email, goal: profiles.goal }).from(profiles).where(inArray(profiles.id, ids));
  return people
    .map((p) => {
      const s = sessionRows.find((r) => r.clientId === p.id);
      const e = programRows.find((r) => r.clientId === p.id);
      const last = [s?.last, e?.last].filter(Boolean).map((d) => new Date(d!).getTime());
      return { ...p, sessions: s?.sessions ?? 0, programs: e?.programs ?? 0, lastActive: new Date(Math.max(...last)) };
    })
    .sort((a, b) => b.lastActive.getTime() - a.lastActive.getTime());
}

export async function countProgramEnrollments(trainerId: string, sinceDays?: number) {
  const [row] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(enrollments)
    .innerJoin(programs, eq(programs.id, enrollments.programId))
    .where(
      and(eq(programs.trainerId, trainerId), sinceDays ? gte(enrollments.createdAt, new Date(Date.now() - sinceDays * 24 * 60 * 60_000)) : undefined),
    );
  return row.n;
}
