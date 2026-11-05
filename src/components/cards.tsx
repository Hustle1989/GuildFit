import Link from "next/link";
import { PlayCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Cover } from "@/components/cover";
import type { ProgramListItem, TrainerListItem } from "@/lib/queries";

export function TrainerCard({ trainer }: { trainer: TrainerListItem }) {
  return (
    <Link
      href={`/trainers/${trainer.slug}`}
      className="group overflow-hidden rounded-2xl border bg-card transition hover:-translate-y-1 hover:border-primary/40"
    >
      <Cover src={trainer.coverUrl ?? trainer.avatarUrl} alt={trainer.name} className="aspect-[4/5]" />
      <div className="space-y-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold group-hover:text-primary">{trainer.name}</h3>
          <span className="text-xs text-muted-foreground">{trainer.programCount} programs</span>
        </div>
        <p className="line-clamp-2 text-sm text-muted-foreground">{trainer.headline}</p>
        <div className="flex flex-wrap gap-1.5">
          {trainer.specialties.slice(0, 3).map((s) => (
            <Badge key={s} variant="secondary">{s}</Badge>
          ))}
        </div>
      </div>
    </Link>
  );
}

export function ProgramCard({ program }: { program: ProgramListItem }) {
  return (
    <Link
      href={`/programs/${program.slug}`}
      className="group overflow-hidden rounded-2xl border bg-card transition hover:-translate-y-1 hover:border-primary/40"
    >
      <div className="relative">
        <Cover src={program.coverUrl} alt={program.title} className="aspect-video" />
        <Badge className="absolute left-3 top-3 capitalize">{program.level}</Badge>
      </div>
      <div className="space-y-1.5 p-4">
        <h3 className="font-semibold group-hover:text-primary">{program.title}</h3>
        <p className="text-sm text-muted-foreground">with {program.trainerName}</p>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <PlayCircle className="size-3.5" /> {program.lessonCount} lessons
        </p>
      </div>
    </Link>
  );
}
