import {
  boolean,
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

export const roleEnum = pgEnum("role", ["client", "trainer"]);
export const levelEnum = pgEnum("level", ["beginner", "intermediate", "advanced"]);
export const membershipStatusEnum = pgEnum("membership_status", [
  "active",
  "non_renewing",
  "attention",
  "cancelled",
]);
export const bookingStatusEnum = pgEnum("booking_status", ["pending", "paid"]);

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();

/** One row per Neon Auth user. `id` is the Neon Auth user id. */
export const profiles = pgTable("profiles", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  role: roleEnum("role"),
  createdAt: createdAt(),
});

export const trainerProfiles = pgTable("trainer_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => profiles.id, { onDelete: "cascade" }),
  slug: text("slug").notNull().unique(),
  headline: text("headline").notNull(),
  bio: text("bio").notNull(),
  specialties: text("specialties").array().notNull().default([]),
  coverUrl: text("cover_url"),
  createdAt: createdAt(),
});

export const programs = pgTable("programs", {
  id: uuid("id").primaryKey().defaultRandom(),
  trainerId: text("trainer_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  level: levelEnum("level").notNull().default("beginner"),
  coverUrl: text("cover_url"),
  published: boolean("published").notNull().default(false),
  createdAt: createdAt(),
});

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
    durationSec: integer("duration_sec"),
  },
  (t) => [unique().on(t.programId, t.position)],
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

export const memberships = pgTable("memberships", {
  userId: text("user_id")
    .primaryKey()
    .references(() => profiles.id, { onDelete: "cascade" }),
  customerCode: text("paystack_customer_code"),
  subscriptionCode: text("subscription_code").unique(),
  emailToken: text("email_token"),
  status: membershipStatusEnum("status").notNull(),
  currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }).notNull(),
});

export const slots = pgTable("slots", {
  id: uuid("id").primaryKey().defaultRandom(),
  trainerId: text("trainer_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  durationMin: integer("duration_min").notNull(),
  priceKobo: integer("price_kobo").notNull(),
  createdAt: createdAt(),
});

/** `slot_id` is unique, so a slot can never have two bookings. */
export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().defaultRandom(),
  slotId: uuid("slot_id")
    .notNull()
    .unique()
    .references(() => slots.id),
  clientId: text("client_id")
    .notNull()
    .references(() => profiles.id),
  trainerId: text("trainer_id")
    .notNull()
    .references(() => profiles.id),
  amountKobo: integer("amount_kobo").notNull(),
  status: bookingStatusEnum("status").notNull().default("pending"),
  reference: text("reference").notNull().unique(),
  createdAt: createdAt(),
  paidAt: timestamp("paid_at", { withTimezone: true }),
});

/** Trainer earnings ledger. `booking_id` is unique so a payment is credited once. */
export const earnings = pgTable("earnings", {
  id: uuid("id").primaryKey().defaultRandom(),
  trainerId: text("trainer_id")
    .notNull()
    .references(() => profiles.id),
  bookingId: uuid("booking_id")
    .notNull()
    .unique()
    .references(() => bookings.id),
  grossKobo: integer("gross_kobo").notNull(),
  feeKobo: integer("fee_kobo").notNull(),
  netKobo: integer("net_kobo").notNull(),
  createdAt: createdAt(),
});

/** Processed Paystack webhook keys, so a resent webhook is ignored. */
export const webhookEvents = pgTable("webhook_events", {
  key: text("key").primaryKey(),
  receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
});
