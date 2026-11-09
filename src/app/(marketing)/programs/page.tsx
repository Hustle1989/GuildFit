import type { Metadata } from "next";
import { CirclePlay } from "lucide-react";
import { ProgramCard } from "@/components/cards";
import { FilterBar } from "@/components/filter-bar";
import { PageHero } from "@/components/page-hero";
import { EmptyState } from "@/components/shared";
import { listPrograms } from "@/lib/queries";
import { isGoal, isLevel, LEVELS } from "@/lib/types";

export const metadata: Metadata = {
  title: "Workout programs",
  description: "Video workout programs from GuildFit coaches. One membership unlocks them all.",
};

export default async function ProgramsPage({ searchParams }: PageProps<"/programs">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.slice(0, 80) : undefined;
  const goal = isGoal(params.goal) ? params.goal : undefined;
  const level = isLevel(params.level) ? params.level : undefined;
  const results = await listPrograms({ q, goal, level });

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
