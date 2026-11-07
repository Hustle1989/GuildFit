"use client";

import { cn } from "@/lib/utils";

/** Minimal accessible on/off switch. */
export function Switch({
  checked,
  onCheckedChange,
  className,
  ...props
}: Omit<React.ComponentProps<"button">, "onChange"> & { checked: boolean; onCheckedChange: (checked: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        checked ? "bg-primary" : "bg-foreground/15",
        className,
      )}
      {...props}
    >
      <span className={cn("size-5 rounded-full bg-white shadow-sm transition-transform", checked ? "translate-x-[22px]" : "translate-x-0.5")} />
    </button>
  );
}
