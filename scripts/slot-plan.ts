/**
 * The open 1:1 times a demo trainer offers, shared by the seed and by
 * `npm run db:slots`. All times are Lagos wall-clock time (WAT, UTC+1).
 */
export type PlannedSlot = { startsAt: Date; durationMin: number; priceKobo: number };

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
export const PLAN_DAYS = 14;

/** `hour:minute` in Lagos, `days` after today's Lagos date. */
function lagosAt(now: number, days: number, hour: number, minute = 0) {
  const lagos = new Date(now + HOUR + days * DAY); // Lagos wall clock read through UTC getters
  return new Date(Date.UTC(lagos.getUTCFullYear(), lagos.getUTCMonth(), lagos.getUTCDate(), hour - 1, minute));
}

/** Price for a shorter session, rounded to ₦500. */
const scaled = (priceKobo: number, factor: number) => Math.round((priceKobo * factor) / 50_000) * 50_000;

/**
 * Two weeks of availability: a morning and an evening slot on weekdays, an
 * extra lunchtime slot some days, two late-morning slots on Saturday and
 * Sundays off. The slug shifts the hours so trainers don't all match.
 */
export function openSlotPlan(slug: string, priceKobo: number, now = Date.now(), days = PLAN_DAYS): PlannedSlot[] {
  const variant = [...slug].reduce((sum, c) => sum + c.charCodeAt(0), 0);
  const plan: PlannedSlot[] = [];
  for (let d = 0; d < days; d++) {
    const weekday = lagosAt(now, d, 12).getUTCDay(); // 0 = Sunday
    if (weekday === 0) continue;
    const times: [hour: number, minute: number, durationMin: number][] =
      weekday === 6
        ? [[9, 0, 60], [11, 0, 60]]
        : [[6 + (variant % 3), 0, 60], [17 + (variant % 2), 30, 45]];
    if (weekday !== 6 && (d + variant) % 3 === 0) times.push([12, 0, 30]);

    for (const [hour, minute, durationMin] of times) {
      const startsAt = lagosAt(now, d, hour, minute);
      if (startsAt.getTime() < now + HOUR) continue; // nothing in the next hour
      const factor = durationMin === 60 ? 1 : durationMin === 45 ? 0.8 : 0.6;
      plan.push({ startsAt, durationMin, priceKobo: scaled(priceKobo, factor) });
    }
  }
  return plan;
}

/** True when two sessions share any minute. */
export function overlaps(a: { startsAt: Date; durationMin: number }, b: { startsAt: Date; durationMin: number }) {
  const aEnd = a.startsAt.getTime() + a.durationMin * 60_000;
  const bEnd = b.startsAt.getTime() + b.durationMin * 60_000;
  return a.startsAt.getTime() < bEnd && b.startsAt.getTime() < aEnd;
}
