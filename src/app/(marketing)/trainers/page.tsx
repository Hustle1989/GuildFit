import type { Metadata } from "next";
import { Users } from "lucide-react";
import { TrainerCard } from "@/components/cards";
import { FilterBar } from "@/components/filter-bar";
import { PageHero } from "@/components/page-hero";
import { EmptyState } from "@/components/shared";
import { listTrainers } from "@/lib/queries";
import { isGoal } from "@/lib/types";

export const metadata: Metadata = {
  title: "Personal trainers",
  description: "Browse GuildFit's personal trainers by goal: strength, HIIT, yoga, mobility, running and more.",
};

export default async function TrainersPage({ searchParams }: PageProps<"/trainers">) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.slice(0, 80) : undefined;
  const goal = isGoal(params.goal) ? params.goal : undefined;
  const results = await listTrainers({ q, goal });

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
