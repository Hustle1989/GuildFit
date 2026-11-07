import Link from "next/link";
import { Search } from "lucide-react";
import { GOAL_ICONS } from "@/components/shared";
import { GOALS, type GoalKey } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

/** URL-driven search + filter chips. A plain GET form, so it works without JS. */
export function FilterBar({
  basePath,
  q,
  goal,
  extra,
  placeholder,
}: {
  basePath: string;
  q?: string;
  goal?: string;
  extra?: { name: string; value?: string; options: readonly string[] };
  placeholder: string;
}) {
  const hrefWith = (changes: Record<string, string | undefined>) => {
    const params = new URLSearchParams();
    const merged = { q, goal, ...(extra ? { [extra.name]: extra.value } : {}), ...changes };
    for (const [k, v] of Object.entries(merged)) if (v) params.set(k, v);
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <div className="space-y-5">
      <form action={basePath} className="flex flex-wrap gap-3">
        <div className="relative min-w-64 flex-1 sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            name="q"
            defaultValue={q}
            placeholder={placeholder}
            className="h-11 w-full rounded-lg border border-border bg-card pl-10 pr-4 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary/60"
          />
        </div>
        {goal && <input type="hidden" name="goal" value={goal} />}
        {extra?.value && <input type="hidden" name={extra.name} value={extra.value} />}
        <button type="submit" className="h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground">
          Search
        </button>
        {extra && (
          <div className="flex rounded-lg border border-border bg-card p-1 text-sm">
            {[undefined, ...extra.options].map((option) => (
              <Link
                key={option ?? "all"}
                href={hrefWith({ [extra.name]: option })}
                className={cn(
                  "rounded-md px-3 py-1.5 capitalize transition",
                  extra.value === option ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {option ?? "All levels"}
              </Link>
            ))}
          </div>
        )}
      </form>

      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {[undefined, ...GOALS.map((g) => g.key)].map((key) => {
          const Icon = key ? GOAL_ICONS[key as GoalKey] : null;
          const active = goal === key;
          return (
            <Link
              key={key ?? "all"}
              href={hrefWith({ goal: key })}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm transition",
                active ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground hover:border-foreground/25 hover:text-foreground",
              )}
            >
              {Icon && <Icon className="size-4" />}
              {key ? GOALS.find((g) => g.key === key)?.label : "All goals"}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
