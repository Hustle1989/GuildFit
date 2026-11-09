/**
 * View models shared by server queries and client components.
 * Queries in `lib/queries.ts` map database rows into these shapes.
 */

export type Level = "beginner" | "intermediate" | "advanced";
export type GoalKey = "strength" | "hiit" | "cardio" | "yoga" | "core" | "mobility" | "recovery" | "home";

export const LEVELS: Level[] = ["beginner", "intermediate", "advanced"];

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
export const GOAL_KEYS = GOALS.map((g) => g.key);
export const goalLabel = (key: string) => GOALS.find((g) => g.key === key)?.label ?? key;
export const isGoal = (value: unknown): value is GoalKey => GOAL_KEYS.includes(value as GoalKey);
export const isLevel = (value: unknown): value is Level => LEVELS.includes(value as Level);

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
  trainer: { name: string; image: string; slug: string; title: string } | null;
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

export const totalMinutes = (p: Pick<Program, "lessons">) => p.lessons.reduce((sum, l) => sum + l.durationMin, 0);

/** Fallback artwork when a trainer or program has no uploaded image yet. */
export const DEFAULT_PROGRAM_IMAGE =
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80";
export const DEFAULT_TRAINER_IMAGE =
  "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1200&q=80";
