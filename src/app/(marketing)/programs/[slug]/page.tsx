import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, CircleCheck, CirclePlay, Clock, Download, MessageCircle, Smartphone, Users } from "lucide-react";
import { LessonRow } from "@/components/cards";
import { GOAL_ICONS, UserAvatar } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { goalLabel, programBySlug, totalMinutes, trainerById } from "@/lib/mock-data";
import { formatNaira, MEMBERSHIP_PRICE_KOBO } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/programs/[slug]">): Promise<Metadata> {
  const program = programBySlug((await params).slug);
  if (!program) return {};
  return { title: program.title, description: program.description, openGraph: { images: [program.image] } };
}

export default async function ProgramPage({ params }: PageProps<"/programs/[slug]">) {
  const program = programBySlug((await params).slug);
  if (!program) notFound();
  const trainer = trainerById(program.trainerId);
  const Icon = GOAL_ICONS[program.goal];
  const first = program.lessons[0];

  return (
    <>
      <section className="relative overflow-hidden border-b border-border/60">
        <Image src={program.image} alt="" fill priority sizes="100vw" className="object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-12 sm:px-6 sm:pt-20">
          <nav className="text-sm text-muted-foreground">
            <Link href="/programs" className="hover:text-primary">Programs</Link> / <span className="text-foreground">{program.title}</span>
          </nav>
          <div className="mt-6 flex flex-wrap gap-2">
            <Badge className="gap-1.5"><Icon className="size-3.5" /> {goalLabel(program.goal)}</Badge>
            <Badge variant="secondary" className="capitalize">{program.level}</Badge>
            {!program.published && <Badge variant="outline">Draft</Badge>}
          </div>
          <h1 className="font-display mt-4 max-w-3xl text-5xl sm:text-7xl">{program.title}</h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">{program.tagline}</p>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4 text-sm">
            {trainer && (
              <Link href={`/trainers/${trainer.slug}`} className="flex items-center gap-3 hover:text-primary">
                <UserAvatar src={trainer.image} name={trainer.name} size={40} />
                <span>
                  <span className="block text-xs text-muted-foreground">Your coach</span>
                  <span className="font-semibold">{trainer.name}</span>
                </span>
              </Link>
            )}
            <span className="flex items-center gap-2"><CirclePlay className="size-4 text-primary" /> {program.lessons.length} lessons</span>
            <span className="flex items-center gap-2"><Clock className="size-4 text-primary" /> {totalMinutes(program)} min total</span>
            <span className="flex items-center gap-2"><CalendarDays className="size-4 text-primary" /> {program.weeks} weeks</span>
            <span className="flex items-center gap-2"><Users className="size-4 text-primary" /> {program.enrolled.toLocaleString()} enrolled</span>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-10">
          <div>
            <h2 className="text-2xl font-bold">About this program</h2>
            <p className="mt-3 leading-relaxed text-foreground/80">{program.description}</p>
          </div>

          <div>
            <h2 className="text-2xl font-bold">What you&apos;ll achieve</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {program.outcomes.map((o) => (
                <li key={o} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 text-sm">
                  <CircleCheck className="mt-0.5 size-4 shrink-0 text-primary" /> {o}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex items-end justify-between">
              <h2 className="text-2xl font-bold">Lessons</h2>
              <p className="text-sm text-muted-foreground">First lesson free</p>
            </div>
            <ol className="mt-4 divide-y divide-border/60 overflow-hidden rounded-2xl border border-border bg-card">
              {program.lessons.map((lesson, i) => (
                <li key={lesson.id}>
                  <LessonRow
                    href={`/programs/${program.slug}/lessons/${lesson.id}`}
                    index={i + 1}
                    title={lesson.title}
                    durationMin={lesson.durationMin}
                    free={i === 0}
                    locked={i > 0}
                  />
                </li>
              ))}
            </ol>
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="glow rounded-2xl border border-primary/30 bg-card p-6">
            <p className="text-sm text-muted-foreground">Included with</p>
            <p className="text-xl font-bold">GuildFit Membership</p>
            <p className="mt-3 text-4xl font-bold">
              {formatNaira(MEMBERSHIP_PRICE_KOBO)}
              <span className="text-base font-medium text-muted-foreground"> / month</span>
            </p>
            <div className="mt-6 space-y-3">
              {first && (
                <Link href={`/programs/${program.slug}/lessons/${first.id}`} className={buttonVariants({ size: "lg", className: "h-12 w-full text-base font-semibold" })}>
                  <CirclePlay /> Watch free preview
                </Link>
              )}
              <Link href="/pricing" className={buttonVariants({ size: "lg", variant: "outline", className: "h-12 w-full text-base" })}>
                Unlock every lesson
              </Link>
            </div>
            <ul className="mt-6 space-y-3 border-t border-border pt-6 text-sm">
              {[
                { icon: CirclePlay, text: "All programs from every coach" },
                { icon: Smartphone, text: "Watch on any device" },
                { icon: MessageCircle, text: "Message your coach anytime" },
                { icon: Download, text: "Track progress lesson by lesson" },
              ].map(({ icon: I, text }) => (
                <li key={text} className="flex items-center gap-3"><I className="size-4 text-primary" /> {text}</li>
              ))}
            </ul>
          </div>
        </aside>
      </section>
    </>
  );
}
