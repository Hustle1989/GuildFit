export { cn } from "cn";

export const PLATFORM_FEE_PERCENT = 10;
export const MEMBERSHIP_PRICE_KOBO = 500_000; // ₦5,000 / month (display only; Paystack plan holds the real price)

export const SPECIALTIES = [
  "Strength",
  "HIIT",
  "Yoga",
  "Weight loss",
  "Mobility",
  "Boxing",
  "Running",
] as const;

export function formatNaira(kobo: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(kobo / 100);
}

export function splitFee(grossKobo: number) {
  const feeKobo = Math.round((grossKobo * PLATFORM_FEE_PERCENT) / 100);
  return { grossKobo, feeKobo, netKobo: grossKobo - feeKobo };
}

export function slugify(text: string) {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 48);
  return `${base || "item"}-${Math.random().toString(36).slice(2, 7)}`;
}

/** Sessions can be joined from 10 minutes before start until the slot ends. */
export function joinWindow(startsAt: Date, durationMin: number) {
  const opensAt = new Date(startsAt.getTime() - 10 * 60_000);
  const closesAt = new Date(startsAt.getTime() + durationMin * 60_000);
  return { opensAt, closesAt };
}
