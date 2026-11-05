/**
 * Demo content: 4 trainers, 6 programs with lessons, and upcoming slots.
 * Run with `npm run db:seed`. Safe to re-run (skips if already seeded).
 *
 * Optional env (point these at files you uploaded to ImageKit):
 *   SEED_IMAGE_BASE=https://ik.imagekit.io/<id>/guildfit/seed   -> trainer-1.jpg … program-6.jpg
 *   SEED_VIDEO_PATH=/guildfit/seed/sample.mp4                    -> private sample lesson video
 */
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { Pool } from "pg";
import * as schema from "../src/db/schema";

config({ path: ".env.local" });

const { profiles, trainerProfiles, programs, lessons, slots } = schema;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

const img = (name: string) => (process.env.SEED_IMAGE_BASE ? `${process.env.SEED_IMAGE_BASE}/${name}.jpg` : null);
const video = process.env.SEED_VIDEO_PATH ?? null;

const TRAINERS = [
  { name: "Amara Okafor", headline: "Strength coach for busy professionals", specialties: ["Strength", "Mobility"], bio: "10 years coaching barbell strength. NASM-certified. I help people with desk jobs get strong, pain-free and confident under the bar." },
  { name: "Tunde Bakare", headline: "HIIT and boxing conditioning", specialties: ["HIIT", "Boxing"], bio: "Former amateur boxer. My sessions are short, intense and fun, built to get you fit fast without a fancy gym." },
  { name: "Zainab Yusuf", headline: "Yoga for strength and calm", specialties: ["Yoga", "Mobility"], bio: "RYT-500 yoga teacher. Vinyasa flows that build real strength, plus breathwork to help you switch off after work." },
  { name: "Chidi Nwosu", headline: "Sustainable weight loss and running", specialties: ["Weight loss", "Running"], bio: "Marathoner and nutrition coach. No crash diets. We build habits, run plans and strength work that stick for life." },
];

const PROGRAMS = [
  { trainer: 0, title: "Barbell Foundations", level: "beginner", lessons: ["Welcome & setup", "The perfect squat", "Deadlift basics", "Bench press technique", "Your first 4-week plan"] },
  { trainer: 0, title: "Desk Worker Mobility", level: "beginner", lessons: ["Why you feel stiff", "Hips & hamstrings", "Upper back reset"] },
  { trainer: 1, title: "20-Minute HIIT Burn", level: "intermediate", lessons: ["Warm-up flow", "Tabata blocks", "Finisher circuit", "Cool down"] },
  { trainer: 1, title: "Boxing Conditioning", level: "advanced", lessons: ["Stance & footwork", "Combos 101", "Bag rounds", "Core for fighters"] },
  { trainer: 2, title: "Power Vinyasa", level: "intermediate", lessons: ["Breath & bandhas", "Sun salutations", "Standing strength", "Arm balances"] },
  { trainer: 3, title: "Couch to 5K", level: "beginner", lessons: ["Shoes, pace & plan", "Week 1-2 runs", "Week 3-5 runs", "Race day"] },
] as const;

async function main() {
  const [existing] = await db.select().from(profiles).where(eq(profiles.id, "seed_trainer_0"));
  if (existing) {
    console.log("Already seeded. Skipping.");
    return;
  }

  const trainerIds: string[] = [];
  for (const [i, t] of TRAINERS.entries()) {
    const id = `seed_trainer_${i}`;
    trainerIds.push(id);
    await db.insert(profiles).values({ id, email: `trainer${i}@seed.guildfit.dev`, name: t.name, role: "trainer", avatarUrl: img(`trainer-${i + 1}`) });
    await db.insert(trainerProfiles).values({
      userId: id,
      slug: t.name.toLowerCase().replace(/\s+/g, "-"),
      headline: t.headline,
      bio: t.bio,
      specialties: [...t.specialties],
      coverUrl: img(`trainer-${i + 1}`),
    });

    // Three upcoming slots per trainer: tomorrow, in 2 days, in 3 days at 18:00 UTC.
    for (let day = 1; day <= 3; day++) {
      const startsAt = new Date();
      startsAt.setUTCDate(startsAt.getUTCDate() + day);
      startsAt.setUTCHours(18, 0, 0, 0);
      await db.insert(slots).values({ trainerId: id, startsAt, durationMin: 60, priceKobo: (10 + i * 2) * 100_000 });
    }
  }

  for (const [i, p] of PROGRAMS.entries()) {
    const [program] = await db
      .insert(programs)
      .values({
        trainerId: trainerIds[p.trainer],
        slug: p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        title: p.title,
        description: `${p.title} by ${TRAINERS[p.trainer].name}. Follow along at your own pace: each lesson builds on the last, with clear cues and progressions for every level.`,
        level: p.level,
        coverUrl: img(`program-${i + 1}`),
        published: true,
      })
      .returning();
    await db.insert(lessons).values(
      p.lessons.map((title, position) => ({
        programId: program.id,
        position: position + 1,
        title,
        notes: "Watch the full video, then try it yourself. Mark the lesson complete when you're done.",
        videoPath: video,
      })),
    );
  }

  console.log(`Seeded ${TRAINERS.length} trainers and ${PROGRAMS.length} programs.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
