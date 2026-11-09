import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Lock } from "lucide-react";
import { LessonRow } from "@/components/cards";
import { MarkCompleteButton } from "@/components/mark-complete-button";
import { UserAvatar } from "@/components/shared";
import { buttonVariants } from "@/components/ui/button";
import { VideoPlayer } from "@/components/video-player";
import { getCompletedLessonIds, getMembership, getProgramBySlug, isMembershipActive } from "@/lib/queries";
import { getCurrentUser } from "@/lib/session";
import { formatNaira, MEMBERSHIP_PRICE_KOBO } from "@/lib/utils";

export default async function LessonPage({ params }: PageProps<"/programs/[slug]/lessons/[lessonId]">) {
  const { slug, lessonId } = await params;
  const [program, viewer] = await Promise.all([getProgramBySlug(slug), getCurrentUser()]);
  const isOwner = !!program && viewer?.id === program.trainerId;
  const index = program?.lessons.findIndex((l) => l.id === lessonId) ?? -1;
  if (!program || index < 0 || (!program.published && !isOwner)) notFound();

  // Access: the first lesson is a free preview; the rest need an active membership (or owning the program).
  const [membership, done] = viewer ? await Promise.all([getMembership(viewer.id), getCompletedLessonIds(viewer.id, program.id)]) : [null, new Set<string>()];
  const unlocked = isOwner || isMembershipActive(membership);
  const lesson = program.lessons[index];
  const trainer = program.trainer;
  const locked = index > 0 && !unlocked;
  const completed = done.size;
  const next = program.lessons[index + 1];
  const lessonHref = (id: string) => `/programs/${program.slug}/lessons/${id}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link href={`/programs/${program.slug}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="size-4" /> {program.title}
        </Link>
        {!viewer ? (
          <Link href="/sign-in" className="text-sm font-semibold text-primary hover:underline">
            Sign in to track progress
          </Link>
        ) : !unlocked ? (
          <Link href="/pricing" className="text-sm font-semibold text-primary hover:underline">
            Become a member to unlock every lesson
          </Link>
        ) : null}
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          {locked ? (
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-border">
              <Image src={program.image} alt="" fill sizes="(min-width: 1024px) 66vw, 100vw" className="object-cover opacity-30 blur-sm" />
              <div className="absolute inset-0 grid place-items-center bg-background/40 p-6 text-center">
                <div className="max-w-sm space-y-4">
                  <span className="mx-auto grid size-14 place-items-center rounded-full border border-primary/40 bg-primary/10 text-primary">
                    <Lock className="size-6" />
                  </span>
                  <h2 className="text-2xl font-bold sm:text-3xl">This lesson is for members</h2>
                  <p className="text-sm text-muted-foreground">
                    Unlock every lesson in every program for {formatNaira(MEMBERSHIP_PRICE_KOBO)}/month. Cancel anytime.
                  </p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <Link href="/pricing" className={buttonVariants({ size: "lg", className: "h-11 px-6 font-semibold" })}>Become a member</Link>
                    <Link href={lessonHref(program.lessons[0].id)} className={buttonVariants({ size: "lg", variant: "outline", className: "h-11 px-6" })}>
                      Watch free lesson
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <VideoPlayer key={lesson.id} poster={program.image} durationMin={lesson.durationMin} title={lesson.title} />
          )}

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Lesson {index + 1} of {program.lessons.length}</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight">{lesson.title}</h1>
            </div>
            {!locked && (
              <div className="flex gap-2">
                {viewer && <MarkCompleteButton lessonId={lesson.id} done={done.has(lesson.id)} />}
                {next && (
                  <Link href={lessonHref(next.id)} className={buttonVariants({ size: "lg", variant: "outline", className: "h-11 px-4" })}>
                    Next <ArrowRight />
                  </Link>
                )}
              </div>
            )}
          </div>

          {trainer && (
            <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
              <UserAvatar src={trainer.image} name={trainer.name} size={44} />
              <div className="flex-1">
                <p className="font-semibold">{trainer.name}</p>
                <p className="text-sm text-muted-foreground">{trainer.title} coach</p>
              </div>
              <Link href="/messages" className={buttonVariants({ variant: "outline" })}>Ask a question</Link>
            </div>
          )}

          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-bold">Coach notes</h2>
            <p className="mt-2 leading-relaxed text-foreground/80">{lesson.notes}</p>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="border-b border-border p-4">
              <p className="font-bold">{program.title}</p>
              <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-primary/15">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${(completed / program.lessons.length) * 100}%` }} />
                </div>
                {completed}/{program.lessons.length}
                {completed > 0 && <Check className="size-3.5 text-primary" />}
              </div>
            </div>
            <ol className="divide-y divide-border/60">
              {program.lessons.map((l, i) => (
                <li key={l.id}>
                  <LessonRow
                    href={lessonHref(l.id)}
                    index={i + 1}
                    title={l.title}
                    durationMin={l.durationMin}
                    locked={i > 0 && !unlocked}
                    free={i === 0 && !unlocked}
                    active={l.id === lesson.id}
                    done={done.has(l.id)}
                  />
                </li>
              ))}
            </ol>
          </div>
        </aside>
      </div>
    </div>
  );
}
