"use client";

import { useState } from "react";
import { cn, formatNaira } from "@/lib/utils";

type Point = { label: string; netKobo: number };

/**
 * Weekly earnings columns. Past weeks are muted green, the current week is the
 * accent. The value is labelled on the latest column, or on whichever column
 * is hovered/focused. Each column is a focusable button with its own label.
 */
export function EarningsChart({ data }: { data: Point[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(...data.map((d) => d.netKobo)) * 1.12; // headroom for the value label
  const last = data.length - 1;
  const labelled = hover ?? last;

  return (
    <div className="flex h-64 items-end gap-2 sm:gap-3.5" role="list" aria-label="Net earnings per week">
      {data.map((d, i) => {
        const pct = (d.netKobo / max) * 100;
        return (
          <button
            key={d.label}
            type="button"
            role="listitem"
            className="group flex h-full min-w-0 flex-1 flex-col items-center gap-2.5 outline-none"
            onPointerEnter={() => setHover(i)}
            onPointerLeave={() => setHover(null)}
            onFocus={() => setHover(i)}
            onBlur={() => setHover(null)}
            aria-label={`Week of ${d.label}: ${formatNaira(d.netKobo)}`}
          >
            <span className="relative flex w-full flex-1 items-end">
              <span
                className={cn(
                  "w-full rounded-t-lg rounded-b-[3px] transition group-focus-visible:ring-2 group-focus-visible:ring-ring",
                  i === last ? "bg-primary" : "bg-chart-1",
                  hover === i && i !== last && "brightness-110 dark:brightness-125",
                )}
                style={{ height: `${pct}%` }}
              />
              {labelled === i && (
                <span
                  className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap pb-1.5 text-xs font-semibold tabular-nums"
                  style={{ bottom: `${pct}%` }}
                >
                  {formatNaira(d.netKobo)}
                </span>
              )}
            </span>
            <span className={cn("truncate text-[11px] text-muted-foreground sm:text-xs", i === last && "font-medium text-foreground")}>{d.label}</span>
          </button>
        );
      })}
    </div>
  );
}
