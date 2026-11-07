import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Dumbbell,
  Flame,
  Flower2,
  HeartPulse,
  House,
  Leaf,
  Move,
  Star,
  Target,
  type LucideIcon,
} from "lucide-react";
import type { GoalKey } from "@/lib/mock-data";
import { cn, initials } from "@/lib/utils";

export const GOAL_ICONS: Record<GoalKey, LucideIcon> = {
  strength: Dumbbell,
  hiit: Flame,
  cardio: HeartPulse,
  yoga: Flower2,
  core: Target,
  mobility: Move,
  recovery: Leaf,
  home: House,
};
export const ActivityIcon = Activity;

export function UserAvatar({ src, name, size = 40, className }: { src?: string | null; name: string; size?: number; className?: string }) {
  return (
    <span
      className={cn("relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-muted text-xs font-semibold", className)}
      style={{ width: size, height: size }}
    >
      {src ? <Image src={src} alt={name} fill sizes={`${size * 2}px`} className="object-cover" /> : initials(name)}
    </span>
  );
}

export function Stars({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex gap-0.5 text-primary", className)} aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="size-3.5 fill-current" />
      ))}
    </span>
  );
}

export function SectionHeading({
  title,
  subtitle,
  href,
  linkLabel,
  eyebrow,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  eyebrow?: string;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="font-display text-3xl sm:text-4xl">{title}</h2>
        {subtitle && <p className="mt-2 text-muted-foreground">{subtitle}</p>}
      </div>
      {href && (
        <Link href={href} className="group inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
          {linkLabel} <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-14 text-center">
      <span className="grid size-12 place-items-center rounded-full border border-primary/30 text-primary">
        <Icon className="size-5" />
      </span>
      <h3 className="font-semibold">{title}</h3>
      {description && <p className="max-w-sm text-sm text-muted-foreground">{description}</p>}
      {children}
    </div>
  );
}

/** Round outlined icon chip (the "Workouts for every goal" row). */
export function IconChip({ icon: Icon, active, className }: { icon: LucideIcon; active?: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "grid size-14 place-items-center rounded-full border transition sm:size-16",
        active ? "border-primary bg-primary/15 text-primary" : "border-border bg-card text-primary group-hover:border-primary/60",
        className,
      )}
    >
      <Icon className="size-6" />
    </span>
  );
}
