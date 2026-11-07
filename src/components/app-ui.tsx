import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { cn, initials } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  children,
}: {
  title: React.ReactNode;
  subtitle?: string;
  eyebrow?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1.5 text-muted-foreground">{subtitle}</p>}
      </div>
      {children && <div className="flex flex-wrap gap-2">{children}</div>}
    </div>
  );
}

/** Stat tile: label + icon chip, big value, one muted line of context. */
export function StatTile({ label, value, icon: Icon, delta }: { label: string; value: string; icon: LucideIcon; delta?: string; highlight?: boolean }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-2 text-3xl font-bold tracking-tight tabular-nums">{value}</p>
      {delta && <p className="mt-1 text-xs text-muted-foreground">{delta}</p>}
    </div>
  );
}

/** Card with a title row; put a list (`divide-y`) or padded content inside. */
export function Panel({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("overflow-hidden rounded-2xl border border-border bg-card", className)}>
      <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-5">
        <div>
          <h2 className="font-semibold">{title}</h2>
          {subtitle && <p className="mt-0.5 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/** A small text link for a panel's top-right corner ("Manage slots", "View all"). */
export function PanelLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-sm font-medium text-primary hover:underline">
      {children}
    </Link>
  );
}

/**
 * Status pills. `solid` = confirmed (Booked), `green` = positive/live (with a dot),
 * `amber` = in progress, `muted` = neutral (Open, Draft, Published).
 */
export function StatusPill({ tone, dot, children }: { tone: "solid" | "green" | "amber" | "muted"; dot?: boolean; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-2 text-xs font-medium",
        tone === "solid" && "bg-primary text-primary-foreground",
        tone === "green" && "bg-primary/12 text-primary",
        tone === "amber" && "bg-amber-500/15 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
        tone === "muted" && "border border-border bg-foreground/[0.04] text-muted-foreground",
      )}
    >
      {dot && <span className={cn("size-1.5 rounded-full bg-current", tone === "green" && "animate-pulse")} />}
      {children}
    </span>
  );
}

/** Initials in a green-tinted circle (how clients appear in the trainer studio). */
export function InitialsAvatar({ name, size = 36, className }: { name: string; size?: number; className?: string }) {
  return (
    <span
      className={cn(
        "inline-grid shrink-0 place-items-center rounded-full border border-primary/20 bg-primary/10 font-semibold text-primary",
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.max(10, Math.round(size * 0.32)) }}
      aria-hidden
    >
      {initials(name)}
    </span>
  );
}
