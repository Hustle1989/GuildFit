import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Lock } from "lucide-react";
import { LessonRow } from "@/components/cards";
import { MarkCompleteButton } from "@/components/mark-complete-button";
import { UserAvatar } from "@/components/shared";
import { buttonVariants } from "@/components/ui/button";
import { VideoPlayer } from "@/components/video-player";
import { myPrograms, programBySlug, trainerById } from "@/lib/mock-data";
import { cn, formatNaira, MEMBERSHIP_PRICE_KOBO } from "@/lib/utils";

export default async function LessonPage({ params, searchParams }: PageProps<"/programs/[slug]/lessons/[lessonId]">) {
  const { slug, lessonId } = await params;
  const { view } = (await searchParams) as { view?: string };
  const program = programBySlug(slug);
  const index = program?.lessons.findIndex((l) => l.id === lessonId) ?? -1;
  if (!program || index < 0) notFound();

  const lesson = program.lessons[index];
  const trainer = trainerById(program.trainerId);
  const isMember = view === "member";
  const locked = index > 0 && !isMember;
  const completed = isMember ? (myPrograms.find((p) => p.programId === program.id)?.completed ?? 0) : 0;
  const next = program.lessons[index + 1];
  const qs = isMember ? "?view=member" : "";
  const lessonHref = (id: string) => `/programs/${program.slug}/lessons/${id}${qs}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <Link href={`/programs/${program.slug}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="size-4" /> {program.title}
        </Link>
        {/* Demo-only toggle to preview both access states */}
        <div className="flex items-center gap-2 rounded-full border border-border bg-card p-1 text-xs">
          <span className="pl-2 text-muted-foreground">Preview as</span>
          {[
            ["visitor", "Visitor", `/programs/${program.slug}/lessons/${lesson.id}`],
            ["member", "Member", `/programs/${program.slug}/lessons/${lesson.id}?view=member`],
          ].map(([key, label, href]) => (
            <Link
              key={key}
              href={href}
              className={cn("rounded-full px-3 py-1.5 font-semibold", (isMember ? "member" : "visitor") === key ? "bg-primary text-primary-foreground" : "text-muted-foreground")}
            >
              {label}
            </Link>
          ))}
        </div>
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
                <MarkCompleteButton />
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
                    locked={i > 0 && !isMember}
                    free={i === 0 && !isMember}
                    active={l.id === lesson.id}
                    done={i < completed}
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
