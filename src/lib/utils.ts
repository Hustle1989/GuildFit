export { cn } from "cn";

export const PLATFORM_FEE_PERCENT = 10;
export const MEMBERSHIP_PRICE_KOBO = 500_000; // ₦5,000 / month

const TZ = "Africa/Lagos"; // fixed zone so server and browser render identical text

export function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(kobo / 100);
}

type DateStyle = "datetime" | "stamp" | "date" | "time" | "day" | "short";

/**
 * datetime "Mon, Nov 9, 10:00 AM" · stamp "Nov 9, 10:00 AM" · date "Nov 9, 2026"
 * time "10:00 AM" · day "Monday, November 9" · short "Nov 9"
 */
export function formatDate(date: Date | string, style: DateStyle = "datetime") {
  const d = new Date(date);
  const options: Record<DateStyle, Intl.DateTimeFormatOptions> = {
    datetime: { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" },
    stamp: { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" },
    date: { day: "numeric", month: "short", year: "numeric" },
    time: { hour: "numeric", minute: "2-digit" },
    day: { weekday: "long", day: "numeric", month: "long" },
    short: { day: "numeric", month: "short" },
  };
  return new Intl.DateTimeFormat("en-US", { timeZone: TZ, ...options[style] }).format(d);
}

/** Pieces for calendar badges: { month: "NOV", day: "9", weekday: "Monday", weekdayShort: "Mon", time: "10:00 AM" }. */
export function dateParts(date: Date | string) {
  const d = new Date(date);
  const part = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-US", { timeZone: TZ, ...o }).format(d);
  return {
    month: part({ month: "short" }).toUpperCase(),
    day: part({ day: "numeric" }),
    weekday: part({ weekday: "long" }),
    weekdayShort: part({ weekday: "short" }),
    time: part({ hour: "numeric", minute: "2-digit" }),
  };
}

/** "Good morning" / "Good afternoon" / "Good evening" for the current Lagos time. */
export function greeting() {
  const hour = Number(new Intl.DateTimeFormat("en-US", { timeZone: TZ, hour: "numeric", hourCycle: "h23" }).format(new Date()));
  return hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Unsplash photo URL at a given width (mock data only). */
export function photo(id: string, width = 1200) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`;
}

/** Sessions can be joined from 10 minutes before start until the slot ends. */
export function joinWindow(startsAt: Date, durationMin: number) {
  return {
    opensAt: new Date(startsAt.getTime() - 10 * 60_000),
    closesAt: new Date(startsAt.getTime() + durationMin * 60_000),
  };
}

export type SessionState = "upcoming" | "joinable" | "ended";

export function sessionState(startsAt: Date, durationMin: number): SessionState {
  const { opensAt, closesAt } = joinWindow(startsAt, durationMin);
  const t = Date.now();
  return t < opensAt.getTime() ? "upcoming" : t <= closesAt.getTime() ? "joinable" : "ended";
}

/** "Starts in 5 min", "Live now", "In 2 days"… */
export function relativeStart(startsAt: Date, durationMin = 60) {
  const mins = Math.round((startsAt.getTime() - Date.now()) / 60_000);
  if (mins <= 0 && mins > -durationMin) return "Live now";
  if (mins <= 0) return `${formatDate(startsAt, "short")}`;
  if (mins < 60) return `Starts in ${mins} min`;
  if (mins < 24 * 60) return `In ${Math.round(mins / 60)} h`;
  const days = Math.round(mins / (24 * 60));
  return days === 1 ? "Tomorrow" : `In ${days} days`;
}

/** "2 min ago", "3 h ago", "Yesterday"… */
export function timeAgo(date: Date) {
  const mins = Math.round((Date.now() - date.getTime()) / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  if (mins < 24 * 60) return `${Math.round(mins / 60)} h ago`;
  if (mins < 48 * 60) return "Yesterday";
  return `${Math.round(mins / (24 * 60))} days ago`;
}
