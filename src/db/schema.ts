import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

// All money is stored in kobo (₦1 = 100 kobo). All timestamps are UTC.
// Users, sessions and accounts live in Neon Auth's own `neon_auth` schema;
// `profiles.id` is the Neon Auth user id (no FK into the managed schema).

export const roleEnum = pgEnum("role", ["client", "trainer"]);
export const levelEnum = pgEnum("level", ["beginner", "intermediate", "advanced"]);
export const membershipStatusEnum = pgEnum("membership_status", ["active", "non_renewing", "attention", "cancelled"]);
export const bookingStatusEnum = pgEnum("booking_status", ["pending", "paid"]);

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

/** One row per Neon Auth user. `role` stays null until onboarding. */
export const profiles = pgTable("profiles", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  role: roleEnum("role"),
  goal: text("goal"), // a client's stated goal, e.g. "Build strength"
  createdAt: createdAt(),
});

export const trainerProfiles = pgTable("trainer_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => profiles.id, { onDelete: "cascade" }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull().default("Personal trainer"), // e.g. "Strength & Muscle"
  headline: text("headline").notNull().default(""),
  bio: text("bio").notNull().default(""),
  goals: text("goals").array().notNull().default([]), // GoalKey values: strength, hiit, yoga…
  location: text("location").notNull().default(""),
  yearsExperience: integer("years_experience").notNull().default(1),
  clientsCoached: integer("clients_coached").notNull().default(0),
  sessionPriceKobo: integer("session_price_kobo").notNull().default(1_500_000),
  certifications: text("certifications").array().notNull().default([]),
  photoUrl: text("photo_url"),
  createdAt: createdAt(),
});

export const programs = pgTable(
  "programs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    trainerId: text("trainer_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    tagline: text("tagline").notNull().default(""),
    description: text("description").notNull().default(""),
    goal: text("goal").notNull().default("strength"), // GoalKey
    level: levelEnum("level").notNull().default("beginner"),
    weeks: integer("weeks").notNull().default(4),
    outcomes: text("outcomes").array().notNull().default([]),
    coverUrl: text("cover_url"),
    published: boolean("published").notNull().default(false),
    createdAt: createdAt(),
  },
  (t) => [index("programs_trainer_idx").on(t.trainerId)],
);

/** The lesson with the lowest position in a program is the free preview. */
export const lessons = pgTable(
  "lessons",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    programId: uuid("program_id")
      .notNull()
      .references(() => programs.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    title: text("title").notNull(),
    notes: text("notes").notNull().default(""),
    videoPath: text("video_path"),
    durationSec: integer("duration_sec").notNull().default(600),
  },
  (t) => [unique("lessons_program_position_unique").on(t.programId, t.position)],
);

export const enrollments = pgTable(
  "enrollments",
  {
    userId: text("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    programId: uuid("program_id")
      .notNull()
      .references(() => programs.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.programId] })],
);

export const lessonProgress = pgTable(
  "lesson_progress",
  {
    userId: text("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    completedAt: timestamp("completed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.lessonId] })],
);

/** Paystack membership. Access = `current_period_end` in the future, whatever the status. */
export const memberships = pgTable("memberships", {
  userId: text("user_id")
    .primaryKey()
    .references(() => profiles.id, { onDelete: "cascade" }),
  customerCode: text("paystack_customer_code"),
  subscriptionCode: text("subscription_code").unique(),
  emailToken: text("email_token"),
  status: membershipStatusEnum("status").notNull(),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }).notNull(),
  createdAt: createdAt(),
});

export const slots = pgTable(
  "slots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    trainerId: text("trainer_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    durationMin: integer("duration_min").notNull(),
    priceKobo: integer("price_kobo").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("slots_trainer_starts_idx").on(t.trainerId, t.startsAt)],
);

/**
 * `slot_id` is unique, so a slot can never have two bookings. A `pending`
 * booking younger than 15 minutes holds the slot during checkout.
 */
export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slotId: uuid("slot_id")
      .notNull()
      .unique()
      .references(() => slots.id, { onDelete: "cascade" }),
    clientId: text("client_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    trainerId: text("trainer_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    amountKobo: integer("amount_kobo").notNull(),
    status: bookingStatusEnum("status").notNull().default("pending"),
    reference: text("reference").notNull().unique(),
    createdAt: createdAt(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
  },
  (t) => [index("bookings_trainer_idx").on(t.trainerId), index("bookings_client_idx").on(t.clientId)],
);

/** Trainer earnings ledger. `booking_id` is unique so a payment is credited once. */
export const earnings = pgTable(
  "earnings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    trainerId: text("trainer_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    bookingId: uuid("booking_id")
      .notNull()
      .unique()
      .references(() => bookings.id, { onDelete: "cascade" }),
    grossKobo: integer("gross_kobo").notNull(),
    feeKobo: integer("fee_kobo").notNull(),
    netKobo: integer("net_kobo").notNull(),
    createdAt: createdAt(),
  },
  (t) => [index("earnings_trainer_idx").on(t.trainerId)],
);

/** Processed Paystack webhook keys, so a resent webhook is ignored. */
export const webhookEvents = pgTable("webhook_events", {
  key: text("key").primaryKey(),
  receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Profile = typeof profiles.$inferSelect;
export type TrainerProfile = typeof trainerProfiles.$inferSelect;
export type Program = typeof programs.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
export type Slot = typeof slots.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
