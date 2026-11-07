import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CirclePlay, Clock, Lock, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { GOAL_ICONS, UserAvatar } from "@/components/shared";
import { goalLabel, totalMinutes, trainerById, type Program, type Trainer } from "@/lib/mock-data";
import { cn, formatNaira } from "@/lib/utils";

/** Landing-page feature card: copy on the left, photo fading in from the right. */
export function ProgramFeatureCard({ program }: { program: Program }) {
  const Icon = GOAL_ICONS[program.goal];
  return (
    <Link
      href={`/programs/${program.slug}`}
      className="group relative flex min-h-64 overflow-hidden rounded-2xl border border-border bg-card transition hover:border-primary/40"
    >
      <Image
        src={program.image}
        alt=""
        fill
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover object-center opacity-80 transition duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-card via-card/85 to-transparent" />
      <div className="relative flex max-w-[65%] flex-col p-5">
        <Icon className="size-7 text-primary" />
        <h3 className="mt-4 text-xl font-semibold leading-tight">{program.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{program.tagline}</p>
        <span className="mt-auto inline-flex w-fit items-center gap-1.5 rounded-md border border-foreground/15 px-3 py-1.5 text-xs font-semibold transition group-hover:border-primary group-hover:text-primary">
          Explore plan <ArrowRight className="size-3.5" />
        </span>
      </div>
    </Link>
  );
}

/** Catalog card used on /programs and trainer pages. */
export function ProgramCard({ program, className }: { program: Program; className?: string }) {
  const trainer = trainerById(program.trainerId);
  return (
    <Link
      href={`/programs/${program.slug}`}
      className={cn("group overflow-hidden rounded-2xl border border-border bg-card transition hover:-translate-y-1 hover:border-primary/40", className)}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={program.image}
          alt={program.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <Badge className="absolute left-3 top-3 capitalize">{program.level}</Badge>
        <span className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs font-medium text-white/90">
          <CirclePlay className="size-3.5" /> {program.lessons.length} lessons · {totalMinutes(program)} min
        </span>
      </div>
      <div className="space-y-3 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">{goalLabel(program.goal)} · {program.weeks} weeks</p>
          <h3 className="mt-1 text-lg font-semibold leading-snug group-hover:text-primary">{program.title}</h3>
        </div>
        {trainer && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserAvatar src={trainer.image} name={trainer.name} size={24} />
            {trainer.name}
          </div>
        )}
      </div>
    </Link>
  );
}

/** Tall photo card for trainers. */
export function TrainerCard({ trainer }: { trainer: Trainer }) {
  return (
    <Link
      href={`/trainers/${trainer.slug}`}
      className="group relative block aspect-[3/4] overflow-hidden rounded-2xl border border-border bg-card"
    >
      <Image
        src={trainer.image}
        alt={trainer.name}
        fill
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover transition duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 space-y-2 p-5 text-white">
        <p className="eyebrow text-mint">{trainer.title}</p>
        <h3 className="text-2xl font-semibold">{trainer.name}</h3>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/75">
          <span className="flex items-center gap-1"><MapPin className="size-3.5" /> {trainer.location}</span>
          <span className="flex items-center gap-1"><Users className="size-3.5" /> {trainer.clients}+ clients</span>
        </div>
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm">
            1:1 from <span className="text-mint font-semibold">{formatNaira(trainer.sessionPriceKobo)}</span>
          </span>
          <span className="grid size-9 place-items-center rounded-full bg-[oklch(0.84_0.19_152)] text-[oklch(0.2_0.04_155)] transition group-hover:scale-110">
            <ArrowRight className="size-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/** A row in a lesson list. */
export function LessonRow({
  href,
  index,
  title,
  durationMin,
  locked,
  free,
  active,
  done,
}: {
  href: string;
  index: number;
  title: string;
  durationMin: number;
  locked?: boolean;
  free?: boolean;
  active?: boolean;
  done?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn("flex items-center gap-3 px-4 py-3.5 text-sm transition hover:bg-foreground/[0.03]", active && "bg-primary/10")}
    >
      <span
        className={cn(
          "grid size-7 shrink-0 place-items-center rounded-full border text-xs font-semibold",
          done ? "border-primary bg-primary text-primary-foreground" : active ? "border-primary text-primary" : "border-foreground/15 text-muted-foreground",
        )}
      >
        {index}
      </span>
      <span className="flex-1">
        <span className={cn("block font-medium", active && "text-primary")}>{title}</span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="size-3" /> {durationMin} min</span>
      </span>
      {free && <Badge variant="secondary">Free</Badge>}
      {locked ? <Lock className="size-4 text-muted-foreground" /> : <CirclePlay className="size-4 text-primary" />}
    </Link>
  );
}
