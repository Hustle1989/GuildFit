/**
 * Hardcoded demo data for the UI-only phase. Every page reads from here.
 * When we integrate Neon/Paystack/Stream, these get replaced by real queries.
 */
import { photo } from "@/lib/utils";

// ---------- time helpers (relative to "now", so the demo always looks current) ----------
const MIN = 60_000;
const DAY = 24 * 60 * MIN;
const now = () => Date.now();
const minutesFromNow = (m: number) => new Date(now() + m * MIN);
/** The demo's "starting soon" session: 5–10 minutes out, on a round 5-minute mark. */
const soon = () => {
  const d = minutesFromNow(5);
  d.setUTCSeconds(0, 0);
  d.setUTCMinutes(Math.ceil(d.getUTCMinutes() / 5) * 5);
  return d;
};
/** A day offset at a fixed Lagos hour (UTC+1). */
const dayAt = (days: number, hourLagos: number, minute = 0) => {
  const d = new Date(now() + days * DAY);
  d.setUTCHours(hourLagos - 1, minute, 0, 0);
  return d;
};

// ---------- types ----------
export type Level = "beginner" | "intermediate" | "advanced";
export type GoalKey = "strength" | "hiit" | "cardio" | "yoga" | "core" | "mobility" | "recovery" | "home";

export type Trainer = {
  id: string;
  slug: string;
  name: string;
  title: string;
  headline: string;
  bio: string;
  goals: GoalKey[];
  image: string;
  location: string;
  yearsExperience: number;
  clients: number;
  sessionPriceKobo: number;
  certifications: string[];
};

export type Lesson = { id: string; title: string; durationMin: number; notes: string };

export type Program = {
  id: string;
  slug: string;
  trainerId: string;
  title: string;
  tagline: string;
  description: string;
  goal: GoalKey;
  level: Level;
  weeks: number;
  image: string;
  published: boolean;
  enrolled: number;
  outcomes: string[];
  lessons: Lesson[];
};

export type Person = { id: string; name: string; email: string; image: string };

export type Slot = {
  id: string;
  trainerId: string;
  startsAt: Date;
  durationMin: number;
  priceKobo: number;
  status: "open" | "held" | "booked";
  clientId?: string;
};

export type Booking = {
  id: string;
  trainerId: string;
  clientId: string;
  startsAt: Date;
  durationMin: number;
  amountKobo: number;
};

export type Message = {
  id: string;
  authorId: string;
  text: string;
  at: Date;
  reactions?: { emoji: string; count: number; mine?: boolean }[];
  replies?: Message[];
};

export type Conversation = { id: string; withId: string; unread: number; messages: Message[] };

// ---------- goals (categories) ----------
export const GOALS: { key: GoalKey; label: string }[] = [
  { key: "strength", label: "Strength" },
  { key: "hiit", label: "HIIT" },
  { key: "cardio", label: "Cardio" },
  { key: "yoga", label: "Yoga" },
  { key: "core", label: "Core" },
  { key: "mobility", label: "Mobility" },
  { key: "recovery", label: "Recovery" },
  { key: "home", label: "At Home" },
];
export const goalLabel = (key: GoalKey) => GOALS.find((g) => g.key === key)?.label ?? key;

// ---------- trainers ----------
export const trainers: Trainer[] = [
  {
    id: "t1",
    slug: "amara-okafor",
    name: "Amara Okafor",
    title: "Strength & Muscle",
    headline: "Strength coach for busy professionals",
    bio: "I've spent 10 years coaching barbell strength to people with desk jobs, long commutes and zero time. My approach is simple: three focused sessions a week, perfect technique, and steady progress you can measure.\n\nExpect clear cues, honest feedback on your form videos, and plans that fit around real life.",
    goals: ["strength", "mobility"],
    image: photo("1550345332-09e3ac987658"),
    location: "Lagos",
    yearsExperience: 10,
    clients: 340,
    sessionPriceKobo: 1_500_000,
    certifications: ["NASM Certified Personal Trainer", "Precision Nutrition L1", "USAW Sports Performance"],
  },
  {
    id: "t2",
    slug: "tunde-bakare",
    name: "Tunde Bakare",
    title: "HIIT & Conditioning",
    headline: "Short, savage workouts that actually fit your day",
    bio: "Former amateur boxer turned conditioning coach. My sessions are short, intense and fun, built to get you fit fast without a fancy gym. If you can spare 20 minutes, I can make you fitter.",
    goals: ["hiit", "cardio", "home"],
    image: photo("1567013127542-490d757e51fc"),
    location: "Abuja",
    yearsExperience: 8,
    clients: 280,
    sessionPriceKobo: 1_200_000,
    certifications: ["ACE Certified Personal Trainer", "CrossFit L2"],
  },
  {
    id: "t3",
    slug: "zainab-yusuf",
    name: "Zainab Yusuf",
    title: "Yoga & Mobility",
    headline: "Yoga for strength, flexibility and calm",
    bio: "RYT-500 yoga teacher. I teach vinyasa flows that build real strength, mobility work that undoes long days at a desk, and breathwork to help you switch off.",
    goals: ["yoga", "mobility", "recovery"],
    image: photo("1552196563-55cd4e45efb3"),
    location: "Lagos",
    yearsExperience: 7,
    clients: 410,
    sessionPriceKobo: 1_000_000,
    certifications: ["RYT-500 Yoga Alliance", "FRC Mobility Specialist"],
  },
  {
    id: "t4",
    slug: "chidi-nwosu",
    name: "Chidi Nwosu",
    title: "Fat Loss & Running",
    headline: "Sustainable fat loss, no crash diets",
    bio: "Marathoner and nutrition coach. We build habits, run plans and strength work that stick for life, so the weight stays off.",
    goals: ["cardio", "strength"],
    image: photo("1581009146145-b5ef050c2e1e"),
    location: "Port Harcourt",
    yearsExperience: 6,
    clients: 220,
    sessionPriceKobo: 1_100_000,
    certifications: ["NSCA-CPT", "Run Coach Level 2"],
  },
  {
    id: "t5",
    slug: "kemi-adeyemi",
    name: "Kemi Adeyemi",
    title: "Glutes & Lower Body",
    headline: "Build a strong, sculpted lower body",
    bio: "I specialise in lower-body strength and core stability. Every plan is progressive, joint-friendly and built around the equipment you actually have.",
    goals: ["strength", "core"],
    image: photo("1594381898411-846e7d193883"),
    location: "Ibadan",
    yearsExperience: 5,
    clients: 190,
    sessionPriceKobo: 1_300_000,
    certifications: ["ISSA Certified Personal Trainer", "Pre/Postnatal Coach"],
  },
  {
    id: "t6",
    slug: "david-mensah",
    name: "David Mensah",
    title: "Hypertrophy",
    headline: "Science-based muscle building",
    bio: "Evidence-based hypertrophy coaching for intermediate lifters who've plateaued. Volume, intensity and recovery, dialled in for you.",
    goals: ["strength", "home"],
    image: photo("1611672585731-fa10603fb9e0"),
    location: "Accra",
    yearsExperience: 9,
    clients: 260,
    sessionPriceKobo: 1_400_000,
    certifications: ["NASM-CPT", "BSc Exercise Science"],
  },
];

// ---------- programs ----------
const lessons = (prefix: string, items: [string, number][]): Lesson[] =>
  items.map(([title, durationMin], i) => ({
    id: `${prefix}-l${i + 1}`,
    title,
    durationMin,
    notes:
      "Warm up for 5 minutes before you start. Watch the full demo once, then follow along. Rest 60–90 seconds between sets and focus on quality over speed.",
  }));

export const programs: Program[] = [
  {
    id: "p1",
    slug: "barbell-foundations",
    trainerId: "t1",
    title: "Barbell Foundations",
    tagline: "Learn the big lifts the right way",
    description:
      "A six-week introduction to the squat, deadlift, bench and overhead press. You'll learn technique, build a base of strength and finish with your own repeatable training plan.",
    goal: "strength",
    level: "beginner",
    weeks: 6,
    image: photo("1517963879433-6ad2b056d712"),
    published: true,
    enrolled: 1240,
    outcomes: ["Master the four big barbell lifts", "Build a safe warm-up routine", "Track progress week by week", "Leave with a 4-week plan of your own"],
    lessons: lessons("p1", [
      ["Welcome & equipment setup", 6],
      ["The perfect squat", 14],
      ["Deadlift basics", 16],
      ["Bench press technique", 12],
      ["Overhead press", 11],
      ["Your first 4-week plan", 9],
    ]),
  },
  {
    id: "p2",
    slug: "20-minute-hiit-burn",
    trainerId: "t2",
    title: "20-Minute HIIT Burn",
    tagline: "Maximum results, minimum time",
    description: "Four weeks of fast, high-intensity sessions you can do anywhere. Every workout is 20 minutes or less, with scalable options for every fitness level.",
    goal: "hiit",
    level: "intermediate",
    weeks: 4,
    image: photo("1599058917212-d750089bc07e"),
    published: true,
    enrolled: 2105,
    outcomes: ["Boost your conditioning fast", "Burn calories in 20 minutes", "No equipment needed", "Scalable for every level"],
    lessons: lessons("p2", [
      ["Dynamic warm-up flow", 7],
      ["Tabata blocks", 20],
      ["Battle rope finisher", 18],
      ["Full-body EMOM", 20],
      ["Cool down & stretch", 8],
    ]),
  },
  {
    id: "p3",
    slug: "power-vinyasa-flow",
    trainerId: "t3",
    title: "Power Vinyasa Flow",
    tagline: "Strength and calm in every flow",
    description: "Build strength, balance and focus through dynamic vinyasa sequences. Each class links breath to movement and ends with a short guided relaxation.",
    goal: "yoga",
    level: "intermediate",
    weeks: 4,
    image: photo("1575052814086-f385e2e2ad1b"),
    published: true,
    enrolled: 1630,
    outcomes: ["Improve flexibility and balance", "Build functional core strength", "Learn breath-led movement", "Reduce stress"],
    lessons: lessons("p3", [
      ["Breath & foundations", 10],
      ["Sun salutations A & B", 18],
      ["Standing strength flow", 25],
      ["Hips & hamstrings", 22],
      ["Arm balances", 24],
    ]),
  },
  {
    id: "p4",
    slug: "couch-to-5k",
    trainerId: "t4",
    title: "Couch to 5K",
    tagline: "From zero to your first 5K",
    description: "An eight-week run/walk plan with strength sessions to keep you injury-free. Perfect if you've never run before, or you're coming back after a long break.",
    goal: "cardio",
    level: "beginner",
    weeks: 8,
    image: photo("1552674605-db6ffd4facb5"),
    published: true,
    enrolled: 3020,
    outcomes: ["Run 5K without stopping", "Learn pacing and breathing", "Strength work for runners", "Race-day strategy"],
    lessons: lessons("p4", [
      ["Shoes, pace & plan", 8],
      ["Weeks 1–2: run/walk", 25],
      ["Strength for runners", 18],
      ["Weeks 3–5: building up", 28],
      ["Weeks 6–8: continuous running", 32],
      ["Race day", 10],
    ]),
  },
  {
    id: "p5",
    slug: "desk-worker-mobility",
    trainerId: "t3",
    title: "Desk Worker Mobility",
    tagline: "Undo the damage of sitting all day",
    description: "Short daily routines for stiff hips, tight hamstrings and a sore upper back. Ten to fifteen minutes a day is all it takes.",
    goal: "mobility",
    level: "beginner",
    weeks: 3,
    image: photo("1599901860904-17e6ed7083a0"),
    published: true,
    enrolled: 980,
    outcomes: ["Relieve back and neck tension", "Open up tight hips", "Better posture at your desk", "A 10-minute daily routine"],
    lessons: lessons("p5", [
      ["Why you feel stiff", 6],
      ["Hips & hamstrings", 12],
      ["Upper back reset", 11],
      ["Daily 10-minute routine", 10],
    ]),
  },
  {
    id: "p6",
    slug: "lower-body-sculpt",
    trainerId: "t5",
    title: "Lower Body Sculpt",
    tagline: "Stronger glutes, legs and core",
    description: "A progressive six-week plan targeting glutes, legs and core with dumbbells and bands. Joint-friendly and built for real results.",
    goal: "strength",
    level: "intermediate",
    weeks: 6,
    image: photo("1546483875-ad9014c88eba"),
    published: true,
    enrolled: 1410,
    outcomes: ["Build stronger glutes and legs", "Improve core stability", "Train with minimal equipment", "Progressive weekly plan"],
    lessons: lessons("p6", [
      ["Activation & warm-up", 8],
      ["Hip thrust mastery", 15],
      ["Split squats & lunges", 17],
      ["Core stability circuit", 14],
      ["Finisher burnouts", 12],
    ]),
  },
  {
    id: "p7",
    slug: "hypertrophy-blueprint",
    trainerId: "t6",
    title: "Hypertrophy Blueprint",
    tagline: "Science-based muscle building",
    description: "A ten-week block for intermediate lifters. Smart volume, progressive overload and recovery strategies to break through plateaus.",
    goal: "strength",
    level: "advanced",
    weeks: 10,
    image: photo("1585152968992-d2b9444408cc"),
    published: true,
    enrolled: 870,
    outcomes: ["Break through strength plateaus", "Understand volume & intensity", "Optimise recovery", "Track your lifts"],
    lessons: lessons("p7", [
      ["Training principles", 12],
      ["Push day", 30],
      ["Pull day", 30],
      ["Leg day", 32],
      ["Deload & recovery", 10],
    ]),
  },
  {
    id: "p8",
    slug: "fight-ready-conditioning",
    trainerId: "t2",
    title: "Fight Ready Conditioning",
    tagline: "Train like a fighter",
    description: "Fighter-style conditioning: bodyweight circuits, sprint intervals and core work that builds serious engine and grit.",
    goal: "home",
    level: "advanced",
    weeks: 6,
    image: photo("1598971639058-fab3c3109a00"),
    published: true,
    enrolled: 760,
    outcomes: ["Build a big aerobic engine", "Explosive bodyweight power", "Fighter core strength", "Mental toughness"],
    lessons: lessons("p8", [
      ["Fighter warm-up", 8],
      ["Bodyweight circuits", 22],
      ["Sprint intervals", 20],
      ["Core like a fighter", 16],
    ]),
  },
  {
    id: "p9",
    slug: "strength-for-runners",
    trainerId: "t1",
    title: "Strength for Runners",
    tagline: "Run faster, stay injury-free",
    description: "Two short strength sessions a week designed to make runners more resilient and efficient. Draft: still being recorded.",
    goal: "strength",
    level: "intermediate",
    weeks: 4,
    image: photo("1476480862126-209bfaa8edc8"),
    published: false,
    enrolled: 0,
    outcomes: ["Stronger hips and ankles", "Fewer running injuries", "Better running economy"],
    lessons: lessons("p9", [
      ["Why runners need strength", 7],
      ["Single-leg strength", 16],
    ]),
  },
];

// ---------- people ----------
/** The signed-in client in the demo. */
export const currentClient: Person = {
  id: "u1",
  name: "Ada Okonkwo",
  email: "ada@example.com",
  image: photo("1531123897727-8f129e1688ce", 400),
};

/** The signed-in trainer in the demo (Amara). */
export const currentTrainer = trainers[0];

export const getClients = (): (Person & { sessions: number; programs: number; lastActive: Date; goal: string })[] => ([
  { ...currentClient, sessions: 4, programs: 2, lastActive: minutesFromNow(-40), goal: "Build strength" },
  { id: "u2", name: "Emeka Obi", email: "emeka@example.com", image: photo("1522529599102-193c0d76b5b6", 400), sessions: 6, programs: 1, lastActive: minutesFromNow(-180), goal: "Gain muscle" },
  { id: "u3", name: "Funmi Adebayo", email: "funmi@example.com", image: photo("1580489944761-15a19d654956", 400), sessions: 2, programs: 1, lastActive: minutesFromNow(-60 * 26), goal: "Lose weight" },
  { id: "u4", name: "Grace Thomas", email: "grace@example.com", image: photo("1494790108377-be9c29b29330", 400), sessions: 0, programs: 1, lastActive: minutesFromNow(-60 * 50), goal: "Get stronger" },
  { id: "u5", name: "Daniel Afolabi", email: "daniel@example.com", image: photo("1507003211169-0a1dd7228f2d", 400), sessions: 3, programs: 0, lastActive: minutesFromNow(-60 * 72), goal: "Mobility" },
  { id: "u6", name: "Sarah Johnson", email: "sarah@example.com", image: photo("1438761681033-6461ffad8d80", 400), sessions: 1, programs: 2, lastActive: minutesFromNow(-60 * 120), goal: "General fitness" },
  { id: "u7", name: "Michael Eze", email: "michael@example.com", image: photo("1500648767791-00dcc994a43e", 400), sessions: 5, programs: 1, lastActive: minutesFromNow(-60 * 200), goal: "Powerlifting" },
]);

export const people: Record<string, { name: string; image: string; role: "trainer" | "client" }> = Object.fromEntries([
  ...trainers.map((t) => [t.id, { name: t.name, image: t.image, role: "trainer" as const }]),
  ...getClients().map((c) => [c.id, { name: c.name, image: c.image, role: "client" as const }]),
]);

// ---------- client (Ada) data ----------
export const getMembership = () => ({
  plan: "GuildFit Monthly",
  status: "active" as "active" | "non_renewing",
  priceKobo: 500_000,
  renewsAt: dayAt(18, 9),
  memberSince: dayAt(-96, 9),
  card: { brand: "Visa", last4: "4081", expires: "08/28" },
});

export const myPrograms = [
  { programId: "p1", completed: 4 },
  { programId: "p3", completed: 1 },
  { programId: "p4", completed: 2 },
];

export const clientStats = { weeklyGoalPercent: 78, workouts: "4/5", minutes: 186, streakDays: 12, lessonsCompleted: 27 };

export const getMyBookings = (): Booking[] => ([
  { id: "b1", trainerId: "t1", clientId: "u1", startsAt: soon(), durationMin: 60, amountKobo: 1_500_000 },
  { id: "b2", trainerId: "t3", clientId: "u1", startsAt: dayAt(2, 7), durationMin: 45, amountKobo: 1_000_000 },
  { id: "b3", trainerId: "t2", clientId: "u1", startsAt: dayAt(-6, 18), durationMin: 60, amountKobo: 1_200_000 },
  { id: "b4", trainerId: "t1", clientId: "u1", startsAt: dayAt(-13, 18), durationMin: 60, amountKobo: 1_500_000 },
]);

export const getInvoices = () => ([
  { id: "inv_6", date: minutesFromNow(-60 * 2), description: "1:1 session · Amara Okafor", amountKobo: 1_500_000, status: "Paid" },
  { id: "inv_5", date: dayAt(-12, 9), description: "GuildFit Monthly", amountKobo: 500_000, status: "Paid" },
  { id: "inv_4", date: dayAt(-14, 9), description: "1:1 session · Amara Okafor", amountKobo: 1_500_000, status: "Paid" },
  { id: "inv_3", date: dayAt(-42, 9), description: "GuildFit Monthly", amountKobo: 500_000, status: "Paid" },
  { id: "inv_2", date: dayAt(-72, 9), description: "GuildFit Monthly", amountKobo: 500_000, status: "Paid" },
  { id: "inv_1", date: dayAt(-96, 9), description: "GuildFit Monthly", amountKobo: 500_000, status: "Paid" },
]);

// ---------- trainer (Amara) data ----------
export const getTrainerSlots = (): Slot[] => ([
  { id: "s1", trainerId: "t1", startsAt: soon(), durationMin: 60, priceKobo: 1_500_000, status: "booked", clientId: "u1" },
  { id: "s2", trainerId: "t1", startsAt: dayAt(1, 7), durationMin: 60, priceKobo: 1_500_000, status: "open" },
  { id: "s3", trainerId: "t1", startsAt: dayAt(1, 18), durationMin: 60, priceKobo: 1_500_000, status: "booked", clientId: "u2" },
  // "held" = someone is in Paystack checkout right now (15-minute hold)
  { id: "s4", trainerId: "t1", startsAt: dayAt(2, 7), durationMin: 45, priceKobo: 1_200_000, status: "held", clientId: "u3" },
  { id: "s5", trainerId: "t1", startsAt: dayAt(2, 18), durationMin: 60, priceKobo: 1_500_000, status: "open" },
  { id: "s6", trainerId: "t1", startsAt: dayAt(3, 9), durationMin: 30, priceKobo: 800_000, status: "open" },
  { id: "s7", trainerId: "t1", startsAt: dayAt(3, 18), durationMin: 60, priceKobo: 1_500_000, status: "booked", clientId: "u6" },
  { id: "s8", trainerId: "t1", startsAt: dayAt(4, 7), durationMin: 60, priceKobo: 1_500_000, status: "open" },
  { id: "s9", trainerId: "t1", startsAt: dayAt(4, 18), durationMin: 60, priceKobo: 1_500_000, status: "open" },
  { id: "s10", trainerId: "t1", startsAt: dayAt(5, 10), durationMin: 45, priceKobo: 1_200_000, status: "open" },
]);

/** Open slots shown on public trainer pages (same shape for every trainer in the demo). */
export function openSlotsFor(trainer: Trainer): Slot[] {
  return [1, 2, 3, 5].flatMap((day, i) => [
    { id: `${trainer.id}-d${day}a`, trainerId: trainer.id, startsAt: dayAt(day, 7 + i), durationMin: 60, priceKobo: trainer.sessionPriceKobo, status: "open" as const },
    { id: `${trainer.id}-d${day}b`, trainerId: trainer.id, startsAt: dayAt(day, 18), durationMin: 45, priceKobo: Math.round(trainer.sessionPriceKobo * 0.8), status: "open" as const },
  ]);
}

/** Paid bookings feed for the trainer dashboard (newest first). */
export const getRecentBookings = () => ([
  { id: "rb1", clientId: "u1", paidAt: minutesFromNow(-2), startsAt: soon(), durationMin: 60, grossKobo: 1_500_000 },
  { id: "rb2", clientId: "u2", paidAt: minutesFromNow(-95), startsAt: dayAt(1, 18), durationMin: 60, grossKobo: 1_500_000 },
  { id: "rb3", clientId: "u5", paidAt: minutesFromNow(-60 * 20), startsAt: dayAt(-1, 7), durationMin: 60, grossKobo: 1_500_000 },
  { id: "rb4", clientId: "u7", paidAt: minutesFromNow(-60 * 30), startsAt: dayAt(-2, 18), durationMin: 45, grossKobo: 1_200_000 },
  { id: "rb5", clientId: "u3", paidAt: minutesFromNow(-60 * 52), startsAt: dayAt(-3, 9), durationMin: 30, grossKobo: 800_000 },
  { id: "rb6", clientId: "u6", paidAt: minutesFromNow(-60 * 75), startsAt: dayAt(-4, 18), durationMin: 60, grossKobo: 1_500_000 },
]);

/** Net earnings per week for the last 8 weeks (oldest first). */
export const getWeeklyEarnings = () =>
  [4_050_000, 5_400_000, 3_780_000, 6_210_000, 5_940_000, 7_020_000, 6_480_000, 8_100_000].map((netKobo, i) => ({
    weekStart: dayAt(-7 * (7 - i), 9),
    netKobo,
  }));

export const getLedger = () => ([
  ...getRecentBookings().map((b) => ({ id: `e-${b.id}`, date: b.paidAt, clientId: b.clientId, grossKobo: b.grossKobo })),
  { id: "e7", date: dayAt(-8, 12), clientId: "u2", grossKobo: 1_500_000 },
  { id: "e8", date: dayAt(-9, 12), clientId: "u1", grossKobo: 1_500_000 },
  { id: "e9", date: dayAt(-11, 12), clientId: "u7", grossKobo: 1_500_000 },
  { id: "e10", date: dayAt(-15, 12), clientId: "u5", grossKobo: 1_200_000 },
].map((row) => {
  const feeKobo = Math.round(row.grossKobo * 0.1);
  return { ...row, feeKobo, netKobo: row.grossKobo - feeKobo };
}));

// ---------- chat ----------
export const getClientConversations = (): Conversation[] => ([
  {
    id: "c1",
    withId: "t1",
    unread: 2,
    messages: [
      { id: "m1", authorId: "u1", text: "Hi Amara! Just finished the deadlift lesson. Could you check my form? I'll send a clip after my session tonight.", at: minutesFromNow(-60 * 20) },
      {
        id: "m2",
        authorId: "t1",
        text: "Love that you're on it! Send it over. Film from the side at hip height so I can see your back angle.",
        at: minutesFromNow(-60 * 19),
        reactions: [{ emoji: "🙌", count: 1, mine: true }],
      },
      {
        id: "m3",
        authorId: "u1",
        text: "Here's my set at 60kg. The last rep felt heavy 😅",
        at: minutesFromNow(-60 * 3),
        replies: [
          { id: "m3r1", authorId: "t1", text: "Bar path is great. Your hips rise a little early on rep 5: think 'chest up, push the floor away'.", at: minutesFromNow(-60 * 2) },
          { id: "m3r2", authorId: "u1", text: "Got it, I'll try that cue next session!", at: minutesFromNow(-100) },
        ],
      },
      {
        id: "m4",
        authorId: "t1",
        text: "Really solid progress this week. Let's go over your next block on our call today 💪",
        at: minutesFromNow(-15),
        reactions: [
          { emoji: "🔥", count: 2 },
          { emoji: "💪", count: 1, mine: true },
        ],
      },
      { id: "m5", authorId: "t1", text: "See you in a few minutes. Have water and your band ready!", at: minutesFromNow(-4) },
    ],
  },
  {
    id: "c2",
    withId: "t3",
    unread: 0,
    messages: [
      { id: "m6", authorId: "t3", text: "Welcome to Power Vinyasa! Take lesson 1 slowly. Breath first, shapes second 🧘🏾‍♀️", at: dayAt(-3, 10) },
      { id: "m7", authorId: "u1", text: "Thank you! My hamstrings are very tight, any tips?", at: dayAt(-3, 11) },
      { id: "m8", authorId: "t3", text: "Bend your knees as much as you need in forward folds. We'll work on it in our session on Thursday.", at: dayAt(-3, 12), reactions: [{ emoji: "❤️", count: 1, mine: true }] },
    ],
  },
  {
    id: "c3",
    withId: "t2",
    unread: 0,
    messages: [
      { id: "m9", authorId: "u1", text: "That HIIT session destroyed me (in a good way) 😂", at: dayAt(-6, 20) },
      { id: "m10", authorId: "t2", text: "Haha that means it worked. Same time next week?", at: dayAt(-6, 21) },
    ],
  },
]);

export const getTrainerConversations = (): Conversation[] => ([
  { ...getClientConversations()[0], withId: "u1" },
  {
    id: "c4",
    withId: "u2",
    unread: 1,
    messages: [
      { id: "m11", authorId: "u2", text: "Booked tomorrow 6pm. Can we focus on bench press?", at: minutesFromNow(-90) },
      { id: "m12", authorId: "t1", text: "Absolutely. Bring your training log and we'll plan your next 4 weeks.", at: minutesFromNow(-80), reactions: [{ emoji: "👍", count: 1 }] },
      { id: "m13", authorId: "u2", text: "Perfect, see you then!", at: minutesFromNow(-75) },
    ],
  },
  {
    id: "c5",
    withId: "u3",
    unread: 0,
    messages: [
      { id: "m14", authorId: "u3", text: "Is Barbell Foundations okay for a complete beginner?", at: dayAt(-1, 9) },
      { id: "m15", authorId: "t1", text: "Yes! It's designed exactly for that. Start with lesson 1. It's free to preview.", at: dayAt(-1, 10) },
    ],
  },
]);

// ---------- marketing ----------
export const testimonials = [
  { name: "Funmi A.", result: "Lost 9kg in 12 weeks", image: photo("1580489944761-15a19d654956", 300), quote: "GuildFit completely changed my relationship with fitness. My coach actually replies, and I finally feel stronger and more confident." },
  { name: "Emeka O.", result: "Gained 6kg of muscle", image: photo("1522529599102-193c0d76b5b6", 300), quote: "The programs are tough but fun, and the 1:1 calls keep me honest. Best money I spend every month." },
  { name: "Grace T.", result: "Stronger & happier", image: photo("1494790108377-be9c29b29330", 300), quote: "More than a workout app. Booking a session with Zainab fixed my back pain in three weeks. I'm hooked." },
];

export const siteStats = [
  { value: "120+", label: "Elite coaches" },
  { value: "2,400+", label: "Video lessons" },
  { value: "4.9", label: "Average rating" },
];

// ---------- lookups ----------
export const trainerById = (id: string) => trainers.find((t) => t.id === id);
export const trainerBySlug = (slug: string) => trainers.find((t) => t.slug === slug);
export const programBySlug = (slug: string) => programs.find((p) => p.slug === slug);
export const programById = (id: string) => programs.find((p) => p.id === id);
export const programsByTrainer = (trainerId: string) => programs.filter((p) => p.trainerId === trainerId && p.published);
export const publishedPrograms = programs.filter((p) => p.published);
export const totalMinutes = (p: Program) => p.lessons.reduce((sum, l) => sum + l.durationMin, 0);
