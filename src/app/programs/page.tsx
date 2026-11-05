import type { Metadata } from "next";
import { PlayCircle } from "lucide-react";
import { ProgramCard } from "@/components/cards";
import { EmptyState } from "@/components/empty-state";
import { FilterBar } from "@/components/filter-bar";
import { listPrograms } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Workout programs",
  description: "Video workout programs from GuildFit coaches. One membership unlocks them all.",
};

const LEVELS = ["beginner", "intermediate", "advanced"] as const;

export default async function ProgramsPage({ searchParams }: PageProps<"/programs">) {
  const { q, level } = (await searchParams) as { q?: string; level?: string };
  const programs = await listPrograms({ q, level: LEVELS.includes(level as never) ? level : undefined });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display mb-8 text-4xl sm:text-5xl">Programs</h1>
      <FilterBar
        basePath="/programs"
        q={q}
        paramName="level"
        active={level}
        options={LEVELS}
        placeholder="Search programs…"
      />
      {programs.length === 0 ? (
        <EmptyState icon={PlayCircle} title="No programs yet" description="Check back soon, or try another filter." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((p) => (
            <ProgramCard key={p.id} program={p} />
          ))}
        </div>
      )}
    </div>
  );
}
