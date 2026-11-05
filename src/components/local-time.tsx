"use client";

/** Formats a date in the viewer's own timezone (the server runs in UTC). */
export function LocalTime({ date, mode = "datetime" }: { date: Date | string; mode?: "datetime" | "date" | "time" }) {
  const d = new Date(date);
  const text =
    mode === "date"
      ? d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })
      : mode === "time"
        ? d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
        : d.toLocaleString(undefined, { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
  return (
    <time dateTime={d.toISOString()} suppressHydrationWarning>
      {text}
    </time>
  );
}
