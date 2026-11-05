import Link from "next/link";
import { desc, eq, sql } from "drizzle-orm";
import { Plus, PlayCircle } from "lucide-react";
import { Cover } from "@/components/cover";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { db, enrollments, lessons, programs } from "@/db";
import { requireTrainer } from "@/lib/session";

export default async function TrainerProgramsPage() {
  const user = await requireTrainer();
  const rows = await db
    .select({
      id: programs.id,
      title: programs.title,
      coverUrl: programs.coverUrl,
      published: programs.published,
      lessonCount: sql<number>`(select count(*)::int from ${lessons} where ${lessons.programId} = ${programs.id})`,
      enrolled: sql<number>`(select count(*)::int from ${enrollments} where ${enrollments.programId} = ${programs.id})`,
    })
    .from(programs)
    .where(eq(programs.trainerId, user.id))
    .orderBy(desc(programs.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Your programs</h1>
        <Link href="/trainer/programs/new" className={buttonVariants()}>
          <Plus /> New program
        </Link>
      </div>
      {rows.length === 0 ? (
        <EmptyState icon={PlayCircle} title="No programs yet" description="Create your first program and upload a lesson." />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((p) => (
            <li key={p.id}>
              <Link href={`/trainer/programs/${p.id}`} className="block overflow-hidden rounded-2xl border bg-card hover:border-primary/40">
                <Cover src={p.coverUrl} alt={p.title} className="aspect-video" />
                <div className="space-y-2 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold">{p.title}</p>
                    <Badge variant={p.published ? "default" : "outline"}>{p.published ? "Live" : "Draft"}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {p.lessonCount} lessons · {p.enrolled} enrolled
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
