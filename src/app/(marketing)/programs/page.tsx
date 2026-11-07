import type { Metadata } from "next";
import { CirclePlay } from "lucide-react";
import { ProgramCard } from "@/components/cards";
import { FilterBar } from "@/components/filter-bar";
import { PageHero } from "@/components/page-hero";
import { EmptyState } from "@/components/shared";
import { publishedPrograms, trainerById, type GoalKey, type Level } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Workout programs",
  description: "Video workout programs from GuildFit coaches. One membership unlocks them all.",
};

const LEVELS = ["beginner", "intermediate", "advanced"] as const;

export default async function ProgramsPage({ searchParams }: PageProps<"/programs">) {
  const { q, goal, level } = (await searchParams) as { q?: string; goal?: GoalKey; level?: Level };
  const query = q?.toLowerCase().trim();
  const results = publishedPrograms.filter(
    (p) =>
      (!goal || p.goal === goal) &&
      (!level || p.level === level) &&
      (!query || `${p.title} ${p.tagline} ${trainerById(p.trainerId)?.name}`.toLowerCase().includes(query)),
  );

  return (
    <>
      <PageHero
        eyebrow="Programs"
        title={<>One membership. <span className="text-primary">Every program.</span></>}
        subtitle="Structured video programs from real coaches. The first lesson of every program is free to watch."
      >
        <FilterBar
          basePath="/programs"
          q={q}
          goal={goal}
          extra={{ name: "level", value: level, options: LEVELS }}
          placeholder="Search programs or coaches…"
        />
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <p className="mb-6 text-sm text-muted-foreground">
          {results.length} {results.length === 1 ? "program" : "programs"}
        </p>
        {results.length === 0 ? (
          <EmptyState icon={CirclePlay} title="No programs match" description="Try another goal or level." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((p) => (
              <ProgramCard key={p.id} program={p} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
