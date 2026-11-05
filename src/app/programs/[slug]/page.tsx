import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Lock, PlayCircle } from "lucide-react";
import { Cover } from "@/components/cover";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { hasActiveMembership } from "@/lib/access";
import { getProgramBySlug } from "@/lib/queries";
import { getCurrentUser } from "@/lib/session";

export async function generateMetadata({ params }: PageProps<"/programs/[slug]">): Promise<Metadata> {
  const program = await getProgramBySlug((await params).slug);
  if (!program?.published) return {};
  return {
    title: program.title,
    description: program.description.slice(0, 160),
    openGraph: { images: program.coverUrl ? [program.coverUrl] : [] },
  };
}

export default async function ProgramPage({ params }: PageProps<"/programs/[slug]">) {
  const program = await getProgramBySlug((await params).slug);
  const user = await getCurrentUser();
  const isOwner = user?.id === program?.trainerId;
  if (!program || (!program.published && !isOwner)) notFound();

  const unlocked = isOwner || (user ? await hasActiveMembership(user.id) : false);
  const first = program.lessons[0];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Cover src={program.coverUrl} alt={program.title} priority sizes="100vw" className="aspect-[21/9] rounded-3xl border" />

      <div className="mt-8 grid gap-10 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div>
          <Badge className="mb-3 capitalize">{program.level}</Badge>
          <h1 className="font-display text-4xl sm:text-5xl">{program.title}</h1>
          <p className="mt-2 text-muted-foreground">
            with{" "}
            {program.trainerSlug ? (
              <Link href={`/trainers/${program.trainerSlug}`} className="text-foreground hover:text-primary">
                {program.trainerName}
              </Link>
            ) : (
              program.trainerName
            )}
          </p>
          <p className="mt-6 whitespace-pre-line leading-relaxed text-foreground/85">{program.description}</p>
          {!program.published && <Badge variant="outline" className="mt-4">Draft: only you can see this</Badge>}
        </div>

        <aside className="space-y-4">
          {first && (
            <Link
              href={`/programs/${program.slug}/lessons/${first.id}`}
              className={buttonVariants({ size: "lg", className: "h-11 w-full" })}
            >
              <PlayCircle /> {unlocked ? "Start program" : "Watch free preview"}
            </Link>
          )}
          {!unlocked && (
            <Link href="/pricing" className={buttonVariants({ size: "lg", variant: "outline", className: "h-11 w-full" })}>
              Join GuildFit to unlock every lesson
            </Link>
          )}

          <ol className="divide-y rounded-2xl border bg-card">
            {program.lessons.map((lesson, i) => {
              const open = unlocked || i === 0;
              return (
                <li key={lesson.id}>
                  <Link
                    href={`/programs/${program.slug}/lessons/${lesson.id}`}
                    className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-muted/50"
                  >
                    <span className="w-5 text-muted-foreground">{i + 1}</span>
                    <span className="flex-1">{lesson.title}</span>
                    {i === 0 && !unlocked && <Badge variant="secondary">Free</Badge>}
                    {open ? <PlayCircle className="size-4 text-primary" /> : <Lock className="size-4 text-muted-foreground" />}
                  </Link>
                </li>
              );
            })}
            {program.lessons.length === 0 && <li className="px-4 py-6 text-sm text-muted-foreground">No lessons yet.</li>}
          </ol>
        </aside>
      </div>
    </div>
  );
}
