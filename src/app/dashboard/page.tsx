import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { and, asc, desc, eq, gt, sql } from "drizzle-orm";
import { CalendarDays, PlayCircle } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { LocalTime } from "@/components/local-time";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { bookings, db, enrollments, lessonProgress, lessons, profiles, programs, slots } from "@/db";
import { getMembership } from "@/lib/access";
import { requireProfile } from "@/lib/session";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await requireProfile();
  if (user.role === "trainer") redirect("/trainer");

  const [membership, upcoming, myPrograms] = await Promise.all([
    getMembership(user.id),
    db
      .select({ id: bookings.id, startsAt: slots.startsAt, durationMin: slots.durationMin, trainerName: profiles.name })
      .from(bookings)
      .innerJoin(slots, eq(slots.id, bookings.slotId))
      .innerJoin(profiles, eq(profiles.id, bookings.trainerId))
      .where(
        and(
          eq(bookings.clientId, user.id),
          eq(bookings.status, "paid"),
          // still upcoming or in progress
          gt(sql`${slots.startsAt} + make_interval(mins => ${slots.durationMin})`, new Date()),
        ),
      )
      .orderBy(asc(slots.startsAt)),
    db
      .select({
        slug: programs.slug,
        title: programs.title,
        total: sql<number>`(select count(*)::int from ${lessons} where ${lessons.programId} = ${programs.id})`,
        done: sql<number>`(select count(*)::int from ${lessonProgress} join ${lessons} on ${lessons.id} = ${lessonProgress.lessonId} where ${lessons.programId} = ${programs.id} and ${lessonProgress.userId} = ${user.id})`,
      })
      .from(enrollments)
      .innerJoin(programs, eq(programs.id, enrollments.programId))
      .where(eq(enrollments.userId, user.id))
      .orderBy(desc(enrollments.createdAt)),
  ]);
  const isMember = membership && membership.currentPeriodEnd > new Date();

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-muted-foreground">Welcome back,</p>
          <h1 className="font-display text-4xl sm:text-5xl">{user.name}</h1>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border bg-card px-4 py-3">
          <Badge variant={isMember ? "default" : "secondary"}>{isMember ? "Member" : "Free"}</Badge>
          <Link href={isMember ? "/billing" : "/pricing"} className="text-sm text-muted-foreground hover:text-primary">
            {isMember ? "Manage billing" : "Unlock all programs →"}
          </Link>
        </div>
      </div>

      <section>
        <h2 className="mb-4 text-xl font-bold">Upcoming sessions</h2>
        {upcoming.length === 0 ? (
          <EmptyState icon={CalendarDays} title="No sessions booked" description="Book a 1:1 video session from any trainer's profile.">
            <Link href="/trainers" className={buttonVariants()}>Find a trainer</Link>
          </EmptyState>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {upcoming.map((s) => (
              <li key={s.id} className="flex items-center justify-between rounded-2xl border bg-card p-4">
                <div>
                  <p className="font-semibold">with {s.trainerName}</p>
                  <p className="text-sm text-muted-foreground"><LocalTime date={s.startsAt} /> · {s.durationMin} min</p>
                </div>
                <Link href={`/sessions/${s.id}`} className={buttonVariants({ variant: "secondary" })}>Open</Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold">My programs</h2>
        {myPrograms.length === 0 ? (
          <EmptyState icon={PlayCircle} title="You haven't started a program" description="Every program's first lesson is free.">
            <Link href="/programs" className={buttonVariants()}>Browse programs</Link>
          </EmptyState>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {myPrograms.map((p) => {
              const pct = p.total ? Math.round((p.done / p.total) * 100) : 0;
              return (
                <li key={p.slug}>
                  <Link href={`/programs/${p.slug}`} className="block rounded-2xl border bg-card p-4 hover:border-primary/40">
                    <p className="font-semibold">{p.title}</p>
                    <p className="mb-3 text-sm text-muted-foreground">{p.done} of {p.total} lessons</p>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
