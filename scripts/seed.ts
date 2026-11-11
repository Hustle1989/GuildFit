/**
 * Seeds the linked Neon branch with GuildFit demo data.
 *
 *   npm run db:seed
 *
 * - Creates real Neon Auth accounts (email + password) for 6 trainers and
 *   7 clients through the Auth sign-up API, so you can sign in as any of them.
 * - Fills profiles, trainer profiles, programs, lessons, slots, bookings,
 *   earnings (8 weeks of history), a membership, enrollments and progress.
 *
 * Safe to re-run: it deletes and recreates only rows owned by the demo
 * accounts (anything a real user booked with a demo trainer goes too).
 * Times are relative to "now", so re-run it before a demo to get a session
 * that starts in ~5 minutes.
 *
 * Env: DATABASE_URL, NEON_AUTH_BASE_URL (from `neon env pull`),
 *      SEED_DEMO_PASSWORD (optional, default below), NEXT_PUBLIC_APP_URL.
 */
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { inArray, sql } from "drizzle-orm";
import { Pool } from "pg";
import * as schema from "../src/db/schema";
import { getClients, programs as seedPrograms, trainers as seedTrainers } from "../src/lib/mock-data";

config({ path: ".env.local" });

const { profiles, trainerProfiles, programs, lessons, enrollments, lessonProgress, memberships, slots, bookings, earnings } = schema;

export const DEMO_PASSWORD = process.env.SEED_DEMO_PASSWORD ?? "GuildFit-demo-2026";
const AUTH_URL = process.env.NEON_AUTH_BASE_URL;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
if (!process.env.DATABASE_URL || !AUTH_URL) throw new Error("Run `neon env pull` first: DATABASE_URL and NEON_AUTH_BASE_URL are required.");

const pool = new Pool({ connectionString: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

// ---------- time helpers ----------
const MIN = 60_000;
const DAY = 24 * 60 * MIN;
const now = Date.now();
const minutesFromNow = (m: number) => new Date(now + m * MIN);
/** A day offset at a fixed Lagos hour (UTC+1). */
const dayAt = (days: number, hourLagos: number, minute = 0) => {
  const d = new Date(now + days * DAY);
  d.setUTCHours(hourLagos - 1, minute, 0, 0);
  return d;
};
/** 5–10 minutes from now on a round 5-minute mark: the "join now" demo session. */
const soon = () => {
  const d = minutesFromNow(5);
  d.setUTCSeconds(0, 0);
  d.setUTCMinutes(Math.ceil(d.getUTCMinutes() / 5) * 5);
  return d;
};

// ---------- demo accounts ----------
const emailFor = (name: string) => `${name.split(" ")[0].toLowerCase()}@guildfit.test`;
const clients = getClients();
const people = [
  ...seedTrainers.map((t) => ({ key: t.id, name: t.name, email: emailFor(t.name), image: t.image, role: "trainer" as const, goal: null })),
  ...clients.map((c) => ({ key: c.id, name: c.name, email: emailFor(c.name), image: c.image, role: "client" as const, goal: c.goal })),
];

/** Signs the account up through Neon Auth, or finds it if it already exists. Returns the Auth user id. */
async function ensureAuthUser(email: string, name: string): Promise<string> {
  const existing = await pool.query<{ id: string }>(`select id from neon_auth."user" where lower(email) = lower($1)`, [email]);
  if (existing.rows[0]) return existing.rows[0].id;

  let res: Response;
  for (let attempt = 1; ; attempt++) {
    res = await fetch(`${AUTH_URL}/sign-up/email`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: APP_URL },
      body: JSON.stringify({ email, name, password: DEMO_PASSWORD }),
    });
    // Auth rate-limits sign-ups; wait it out instead of failing the seed.
    if (res.status !== 429 || attempt === 8) break;
    const wait = Number(res.headers.get("x-retry-after") ?? res.headers.get("retry-after") ?? 10);
    process.stdout.write(`  rate limited, retrying ${email} in ${wait}s…\n`);
    await new Promise((r) => setTimeout(r, Math.max(wait, 2) * 1000));
  }
  if (res.ok) {
    const body = (await res.json()) as { user?: { id: string } };
    if (body.user?.id) return body.user.id;
  }
  const { rows } = await pool.query<{ id: string }>(`select id from neon_auth."user" where lower(email) = lower($1)`, [email]);
  if (rows[0]) return rows[0].id;
  throw new Error(`Could not create Neon Auth user ${email}: ${res.status} ${await res.text()}`);
}

async function main() {
  console.log(`Seeding ${new URL(process.env.DATABASE_URL!).host} …`);

  // 1. Auth accounts
  const ids: Record<string, string> = {};
  for (const p of people) ids[p.key] = await ensureAuthUser(p.email, p.name);
  console.log(`✓ ${people.length} Neon Auth accounts ready`);

  // 2. Reset demo-owned rows (cascades to everything they own)
  const demoIds = Object.values(ids);
  await db.delete(bookings).where(inArray(bookings.clientId, demoIds));
  await db.delete(profiles).where(inArray(profiles.id, demoIds));

  // 3. Profiles + trainer profiles
  await db.insert(profiles).values(
    people.map((p) => ({ id: ids[p.key], email: p.email, name: p.name, avatarUrl: p.image, role: p.role, goal: p.goal })),
  );
  await db.insert(trainerProfiles).values(
    seedTrainers.map((t) => ({
      userId: ids[t.id],
      slug: t.slug,
      title: t.title,
      headline: t.headline,
      bio: t.bio,
      goals: t.goals,
      location: t.location,
      yearsExperience: t.yearsExperience,
      clientsCoached: t.clients,
      sessionPriceKobo: t.sessionPriceKobo,
      certifications: t.certifications,
      photoUrl: t.image,
    })),
  );
  console.log(`✓ ${people.length} profiles, ${seedTrainers.length} trainer profiles`);

  // 4. Programs + lessons
  const programIds: Record<string, string> = {};
  const lessonIds: Record<string, string[]> = {};
  for (const [i, p] of seedPrograms.entries()) {
    const [row] = await db
      .insert(programs)
      .values({
        trainerId: ids[p.trainerId],
        slug: p.slug,
        title: p.title,
        tagline: p.tagline,
        description: p.description,
        goal: p.goal,
        level: p.level,
        weeks: p.weeks,
        outcomes: p.outcomes,
        coverUrl: p.image,
        published: p.published,
        createdAt: new Date(now - (seedPrograms.length - i) * 7 * DAY),
      })
      .returning({ id: programs.id });
    programIds[p.id] = row.id;
    const inserted = await db
      .insert(lessons)
      .values(p.lessons.map((l, position) => ({ programId: row.id, position, title: l.title, notes: l.notes, durationSec: l.durationMin * 60 })))
      .returning({ id: lessons.id });
    lessonIds[p.id] = inserted.map((l) => l.id);
  }
  const lessonCount = Object.values(lessonIds).reduce((n, l) => n + l.length, 0);
  console.log(`✓ ${seedPrograms.length} programs, ${lessonCount} lessons`);

  // 5. Memberships, enrollments and progress
  await db.insert(memberships).values([
    { userId: ids.u1, status: "active", currentPeriodEnd: dayAt(18, 9), createdAt: dayAt(-96, 9) },
    { userId: ids.u2, status: "active", currentPeriodEnd: dayAt(9, 9), createdAt: dayAt(-40, 9) },
    { userId: ids.u6, status: "non_renewing", currentPeriodEnd: dayAt(4, 9), createdAt: dayAt(-27, 9) },
  ]);
  const enrolled: [string, string, number][] = [
    // [client, program, lessons completed]
    ["u1", "p1", 4], ["u1", "p3", 1], ["u1", "p4", 2],
    ["u2", "p1", 6], ["u2", "p7", 2], ["u3", "p1", 1], ["u3", "p6", 3],
    ["u4", "p2", 2], ["u5", "p5", 4], ["u6", "p1", 2], ["u6", "p3", 5], ["u7", "p8", 1], ["u7", "p1", 3],
  ];
  await db.insert(enrollments).values(enrolled.map(([u, p], i) => ({ userId: ids[u], programId: programIds[p], createdAt: dayAt(-30 + i, 8) })));
  await db.insert(lessonProgress).values(
    enrolled.flatMap(([u, p, done]) =>
      lessonIds[p].slice(0, done).map((lessonId, i) => ({ userId: ids[u], lessonId, completedAt: dayAt(-done + i, 19) })),
    ),
  );
  console.log(`✓ 3 memberships, ${enrolled.length} enrollments with progress`);

  // 6. Slots, bookings and earnings
  type SlotSeed = { trainer: string; startsAt: Date; durationMin: number; priceKobo: number; booking?: { client: string; status: "paid" | "pending"; at: Date } };
  const amara = "t1";
  const slotSeeds: SlotSeed[] = [
    // Amara's upcoming week (the trainer dashboard demo)
    { trainer: amara, startsAt: soon(), durationMin: 60, priceKobo: 1_500_000, booking: { client: "u1", status: "paid", at: minutesFromNow(-2) } },
    { trainer: amara, startsAt: dayAt(1, 7), durationMin: 60, priceKobo: 1_500_000 },
    { trainer: amara, startsAt: dayAt(1, 18), durationMin: 60, priceKobo: 1_500_000, booking: { client: "u2", status: "paid", at: minutesFromNow(-95) } },
    { trainer: amara, startsAt: dayAt(2, 7), durationMin: 45, priceKobo: 1_200_000, booking: { client: "u3", status: "pending", at: minutesFromNow(0) } },
    { trainer: amara, startsAt: dayAt(2, 18), durationMin: 60, priceKobo: 1_500_000 },
    { trainer: amara, startsAt: dayAt(3, 9), durationMin: 30, priceKobo: 800_000 },
    { trainer: amara, startsAt: dayAt(3, 18), durationMin: 60, priceKobo: 1_500_000, booking: { client: "u6", status: "paid", at: minutesFromNow(-60 * 20) } },
    { trainer: amara, startsAt: dayAt(4, 7), durationMin: 60, priceKobo: 1_500_000 },
    { trainer: amara, startsAt: dayAt(4, 18), durationMin: 60, priceKobo: 1_500_000 },
    { trainer: amara, startsAt: dayAt(5, 10), durationMin: 45, priceKobo: 1_200_000 },
    // Ada's other upcoming session (with Zainab)
    { trainer: "t3", startsAt: dayAt(2, 7), durationMin: 45, priceKobo: 1_000_000, booking: { client: "u1", status: "paid", at: dayAt(-1, 20) } },
  ];

  // Amara's last 8 weeks of paid sessions, so the earnings chart has history.
  const perWeek = [3, 4, 3, 5, 4, 5, 5, 4];
  const rotation = ["u1", "u2", "u5", "u7", "u3", "u6", "u4"];
  let r = 0;
  perWeek.forEach((count, w) => {
    const weeksAgo = perWeek.length - 1 - w;
    for (let i = 0; i < count; i++) {
      const startsAt = dayAt(-(weeksAgo * 7) - 1 - i, i % 2 ? 18 : 7);
      if (startsAt.getTime() > now - 60 * MIN) continue;
      const price = i === 2 ? 1_200_000 : 1_500_000;
      slotSeeds.push({
        trainer: amara,
        startsAt,
        durationMin: price === 1_200_000 ? 45 : 60,
        priceKobo: price,
        booking: { client: rotation[r++ % rotation.length], status: "paid", at: new Date(startsAt.getTime() - 26 * 60 * MIN) },
      });
    }
  });
  // Ada's past sessions with Tunde
  slotSeeds.push({ trainer: "t2", startsAt: dayAt(-6, 18), durationMin: 60, priceKobo: 1_200_000, booking: { client: "u1", status: "paid", at: dayAt(-8, 12) } });

  // Open slots for every other trainer over the next week
  for (const t of seedTrainers.filter((t) => t.id !== amara)) {
    [1, 2, 3, 5].forEach((day, i) => {
      slotSeeds.push({ trainer: t.id, startsAt: dayAt(day, 7 + i), durationMin: 60, priceKobo: t.sessionPriceKobo });
      slotSeeds.push({ trainer: t.id, startsAt: dayAt(day, 18), durationMin: 45, priceKobo: Math.round(t.sessionPriceKobo * 0.8) });
    });
  }

  let paid = 0;
  for (const s of slotSeeds) {
    const [slot] = await db
      .insert(slots)
      .values({ trainerId: ids[s.trainer], startsAt: s.startsAt, durationMin: s.durationMin, priceKobo: s.priceKobo, createdAt: new Date(s.startsAt.getTime() - 10 * DAY) })
      .returning({ id: slots.id });
    if (!s.booking) continue;
    const [booking] = await db
      .insert(bookings)
      .values({
        slotId: slot.id,
        clientId: ids[s.booking.client],
        trainerId: ids[s.trainer],
        amountKobo: s.priceKobo,
        status: s.booking.status,
        reference: `gf_seed_${slot.id.slice(0, 8)}`,
        createdAt: s.booking.at,
        paidAt: s.booking.status === "paid" ? s.booking.at : null,
      })
      .returning({ id: bookings.id });
    if (s.booking.status === "paid") {
      const fee = Math.round(s.priceKobo * 0.1);
      await db.insert(earnings).values({ trainerId: ids[s.trainer], bookingId: booking.id, grossKobo: s.priceKobo, feeKobo: fee, netKobo: s.priceKobo - fee, createdAt: s.booking.at });
      paid++;
    }
  }
  console.log(`✓ ${slotSeeds.length} slots, ${paid} paid bookings with earnings`);

  const [{ users }] = (await db.execute(sql`select count(*)::int as users from neon_auth."user"`)).rows as { users: number }[];
  console.log(`\nDone. ${users} Neon Auth users on this branch.`);
  console.log(`Demo sign-in (password: ${DEMO_PASSWORD}):`);
  console.log(`  trainer  ${emailFor("Amara Okafor")}`);
  console.log(`  client   ${emailFor("Ada Okonkwo")}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
