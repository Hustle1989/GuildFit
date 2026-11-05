import type { Metadata } from "next";
import { Users } from "lucide-react";
import { TrainerCard } from "@/components/cards";
import { EmptyState } from "@/components/empty-state";
import { FilterBar } from "@/components/filter-bar";
import { listTrainers } from "@/lib/queries";
import { SPECIALTIES } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Personal trainers",
  description: "Browse GuildFit's personal trainers by specialty: strength, HIIT, yoga, weight loss and more.",
};

export default async function TrainersPage({ searchParams }: PageProps<"/trainers">) {
  const { q, specialty } = (await searchParams) as { q?: string; specialty?: string };
  const trainers = await listTrainers({ q, specialty });

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-display mb-8 text-4xl sm:text-5xl">Find your trainer</h1>
      <FilterBar
        basePath="/trainers"
        q={q}
        paramName="specialty"
        active={specialty}
        options={SPECIALTIES}
        placeholder="Search by name or focus…"
      />
      {trainers.length === 0 ? (
        <EmptyState icon={Users} title="No trainers match" description="Try a different search or specialty." />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {trainers.map((t) => (
            <TrainerCard key={t.id} trainer={t} />
          ))}
        </div>
      )}
    </div>
  );
}
