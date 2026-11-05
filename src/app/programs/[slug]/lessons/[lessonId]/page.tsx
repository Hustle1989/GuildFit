import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq, inArray } from "drizzle-orm";
import { CheckCircle2, Circle, Lock, VideoOff } from "lucide-react";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/submit-button";
import { buttonVariants } from "@/components/ui/button";
import { db, enrollments, lessonProgress } from "@/db";
import { canWatchLesson } from "@/lib/access";
import { signedVideoUrl } from "@/lib/imagekit";
import { getProgramBySlug } from "@/lib/queries";
import { getCurrentUser } from "@/lib/session";
import { cn } from "@/lib/utils";
import { markLessonComplete } from "./actions";

export default async function LessonPage({ params }: PageProps<"/programs/[slug]/lessons/[lessonId]">) {
  const { slug, lessonId } = await params;
  const [program, user] = await Promise.all([getProgramBySlug(slug), getCurrentUser()]);
  const lesson = program?.lessons.find((l) => l.id === lessonId);
  const isOwner = user?.id === program?.trainerId;
  if (!program || !lesson || (!program.published && !isOwner)) notFound();

  const allowed = await canWatchLesson(user?.id ?? null, lesson.id, program.id);

  // First time a signed-in viewer opens a lesson, enroll them (for trainer stats).
  if (allowed && user && !isOwner) {
    await db.insert(enrollments).values({ userId: user.id, programId: program.id }).onConflictDoNothing();
  }

  const completed = user
    ? await db
        .select({ lessonId: lessonProgress.lessonId })
        .from(lessonProgress)
        .where(and(eq(lessonProgress.userId, user.id), inArray(lessonProgress.lessonId, program.lessons.map((l) => l.id))))
    : [];
  const done = new Set(completed.map((c) => c.lessonId));

  // Private ImageKit video: signed URL that expires in 1 hour.
  const videoUrl = allowed && lesson.videoPath ? signedVideoUrl(lesson.videoPath) : null;

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-5">
        <div className="aspect-video overflow-hidden rounded-2xl border bg-black">
          {!allowed ? (
            <div className="grid h-full place-items-center p-6 text-center">
              <div className="space-y-3">
                <Lock className="mx-auto size-8 text-primary" />
                <h2 className="text-2xl font-bold">Members only</h2>
                <p className="text-muted-foreground">Join GuildFit to unlock every lesson in every program.</p>
                <Link href={user ? "/pricing" : "/sign-up"} className={buttonVariants({ size: "lg" })}>
                  Unlock with membership
                </Link>
              </div>
            </div>
          ) : videoUrl ? (
            <video key={lesson.id} src={videoUrl} controls playsInline className="size-full" controlsList="nodownload" />
          ) : (
            <div className="grid h-full place-items-center text-muted-foreground">
              <p className="flex items-center gap-2"><VideoOff className="size-4" /> Video coming soon</p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href={`/programs/${program.slug}`} className="text-sm text-muted-foreground hover:text-primary">
              {program.title}
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">{lesson.title}</h1>
          </div>
          {allowed && user && !done.has(lesson.id) && (
            <ActionForm action={markLessonComplete} successMessage="Nice work! Lesson complete.">
              <input type="hidden" name="lessonId" value={lesson.id} />
              <SubmitButton variant="secondary"><CheckCircle2 /> Mark complete</SubmitButton>
            </ActionForm>
          )}
        </div>
        {lesson.notes && <p className="whitespace-pre-line leading-relaxed text-foreground/85">{lesson.notes}</p>}
      </div>

      <aside>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Lessons</h2>
        <ol className="divide-y rounded-2xl border bg-card">
          {program.lessons.map((l, i) => (
            <li key={l.id}>
              <Link
                href={`/programs/${program.slug}/lessons/${l.id}`}
                className={cn("flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted/50", l.id === lesson.id && "bg-muted")}
              >
                {done.has(l.id) ? <CheckCircle2 className="size-4 text-primary" /> : <Circle className="size-4 text-muted-foreground" />}
                <span className="flex-1">{i + 1}. {l.title}</span>
              </Link>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
}
