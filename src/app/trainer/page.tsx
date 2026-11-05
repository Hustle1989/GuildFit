import type { Metadata } from "next";
import { count, eq, sql } from "drizzle-orm";
import { db, enrollments, lessonProgress, lessons, programs } from "@/db";
import { loadTrainerBookings } from "@/lib/realtime";
import { requireTrainer } from "@/lib/session";
import { LiveBookings } from "./live-bookings";
import { SentryTestButton } from "./sentry-test-button";

export const metadata: Metadata = { title: "Trainer studio" };

export default async function TrainerOverviewPage() {
  const user = await requireTrainer();

  const [{ rows, sealedQuery }, [stats]] = await Promise.all([
    loadTrainerBookings(user.id),
    db
      .select({
        programs: count(programs.id),
        enrollments: sql<number>`(select count(*)::int from ${enrollments} join ${programs} on ${programs.id} = ${enrollments.programId} where ${programs.trainerId} = ${user.id})`,
        completions: sql<number>`(select count(*)::int from ${lessonProgress} join ${lessons} on ${lessons.id} = ${lessonProgress.lessonId} join ${programs} on ${programs.id} = ${lessons.programId} where ${programs.trainerId} = ${user.id})`,
      })
      .from(programs)
      .where(eq(programs.trainerId, user.id)),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-muted-foreground">Trainer studio</p>
        <h1 className="font-display text-4xl sm:text-5xl">Hey, {user.name.split(" ")[0]}</h1>
      </div>

      <LiveBookings
        url={sealedQuery ? (process.env.NEXT_PUBLIC_NEON_REALTIME_URL ?? null) : null}
        sealedQuery={sealedQuery}
        initialRows={rows}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <MiniStat label="Programs" value={stats?.programs ?? 0} />
        <MiniStat label="Program enrollments" value={stats?.enrollments ?? 0} />
        <MiniStat label="Lessons completed by clients" value={stats?.completions ?? 0} />
      </div>

      <SentryTestButton />
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
