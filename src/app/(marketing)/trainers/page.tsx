import type { Metadata } from "next";
import { Users } from "lucide-react";
import { TrainerCard } from "@/components/cards";
import { FilterBar } from "@/components/filter-bar";
import { PageHero } from "@/components/page-hero";
import { EmptyState } from "@/components/shared";
import { trainers, type GoalKey } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Personal trainers",
  description: "Browse GuildFit's personal trainers by goal: strength, HIIT, yoga, mobility, running and more.",
};

export default async function TrainersPage({ searchParams }: PageProps<"/trainers">) {
  const { q, goal } = (await searchParams) as { q?: string; goal?: GoalKey };
  const query = q?.toLowerCase().trim();
  const results = trainers.filter(
    (t) =>
      (!goal || t.goals.includes(goal)) &&
      (!query || `${t.name} ${t.title} ${t.headline} ${t.location}`.toLowerCase().includes(query)),
  );

  return (
    <>
      <PageHero
        eyebrow="Find your coach"
        title={<>Train with the <span className="text-primary">best</span></>}
        subtitle="Certified coaches for every goal. Message them for free, follow their programs, or book a private 1:1 video session."
      >
        <FilterBar basePath="/trainers" q={q} goal={goal} placeholder="Search by name, focus or city…" />
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <p className="mb-6 text-sm text-muted-foreground">
          {results.length} {results.length === 1 ? "trainer" : "trainers"}
        </p>
        {results.length === 0 ? (
          <EmptyState icon={Users} title="No trainers match" description="Try a different search or goal." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {results.map((t) => (
              <TrainerCard key={t.id} trainer={t} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
