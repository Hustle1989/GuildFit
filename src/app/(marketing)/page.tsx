import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CirclePlay,
  CircleCheck,
  Dumbbell,
  HeartPulse,
  MessageCircle,
  Play,
  TrendingUp,
  Users,
  Video,
} from "lucide-react";
import { ProgramFeatureCard, TrainerCard } from "@/components/cards";
import { NewsletterForm } from "@/components/newsletter-form";
import { ProgressRing } from "@/components/progress-ring";
import { GOAL_ICONS, IconChip, SectionHeading, Stars, UserAvatar } from "@/components/shared";
import { buttonVariants } from "@/components/ui/button";
import { siteStats, testimonials } from "@/lib/mock-data";
import { listPrograms, listTrainers } from "@/lib/queries";
import { GOALS } from "@/lib/types";
import { photo } from "@/lib/utils";

export default async function HomePage() {
  const [featured, coaches] = await Promise.all([listPrograms({ limit: 4 }), listTrainers()]);
  return (
    <>
      <Hero />

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHeading
          title="Training programs"
          subtitle="Goal-based plans designed by expert coaches. Real results for real people."
          href="/programs"
          linkLabel="View all programs"
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((program) => (
            <ProgramFeatureCard key={program.id} program={program} />
          ))}
        </div>
      </section>

      <Goals />

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <SectionHeading
          eyebrow="Meet your coaches"
          title="Coaches who actually show up"
          subtitle="Certified trainers who reply to your messages and coach you face to face."
          href="/trainers"
          linkLabel="Browse all trainers"
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {coaches.slice(0, 4).map((trainer) => (
            <TrainerCard key={trainer.id} trainer={trainer} />
          ))}
        </div>
      </section>

      <HowItWorks />
      <Testimonials />
      <Community />
    </>
  );
}

const HERO_PHOTO = photo("1574680178050-55c6a6a96e0a", 1800);

const HERO_POINTS = [
  { icon: Dumbbell, title: "Train", text: "Video programs, anytime" },
  { icon: MessageCircle, title: "Connect", text: "Chat with your coach" },
  { icon: HeartPulse, title: "Thrive", text: "Real, lasting results" },
];

/** Script tagline + Train/Connect/Thrive list; always sits on the (dark) photo. */
function HeroOverlay({ className }: { className?: string }) {
  return (
    <div className={className}>
      <p className="font-script text-mint absolute right-4 top-6 -rotate-6 text-right text-5xl sm:right-8 md:top-[9%] lg:text-6xl">
        Stronger.
        <br />
        Fitter.
        <br />
        Unstoppable.
      </p>
      <ul className="absolute bottom-6 right-4 space-y-4 sm:right-8 md:bottom-[18%]">
        {HERO_POINTS.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-center gap-3 text-white">
            <span className="text-mint grid size-10 place-items-center rounded-full border border-white/20 bg-black/40 backdrop-blur">
              <Icon className="size-4.5" />
            </span>
            <span>
              <span className="block text-xs font-semibold uppercase tracking-[0.18em]">{title}</span>
              <span className="text-sm text-white/70">{text}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* desktop: photo on the right half, fading into the page */}
      <div className="absolute inset-y-0 right-0 hidden w-[58%] md:block">
        <div className="hero-fade absolute inset-0">
          <Image src={HERO_PHOTO} alt="" fill priority sizes="58vw" className="object-cover object-[center_25%]" />
        </div>
        <HeroOverlay />
      </div>
      <div className="pointer-events-none absolute -left-40 top-1/4 size-[480px] rounded-full bg-primary/10 blur-[120px]" />

      <div className="relative mx-auto flex min-h-[620px] max-w-7xl items-center px-4 py-16 sm:px-6 lg:py-20">
        <div className="w-full md:max-w-[48%]">
          <p className="eyebrow">Stronger every day</p>
          <h1 className="font-display mt-5 text-5xl sm:text-6xl lg:text-7xl">
            Train with the best.
            <br />
            <span className="text-primary">Anywhere.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-muted-foreground">
            Elite personal trainers, step-by-step video programs, and 1:1 coaching calls. All in one place, built around your schedule.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/trainers" className={buttonVariants({ size: "lg", className: "glow h-11 px-5 font-semibold" })}>
              Find your trainer <ArrowRight />
            </Link>
            <Link href="/programs/barbell-foundations/lessons/p1-l1" className={buttonVariants({ size: "lg", variant: "outline", className: "h-11 px-5" })}>
              <CirclePlay /> Watch a free lesson
            </Link>
          </div>

          <dl className="mt-12 flex flex-wrap gap-y-4 divide-x divide-border">
            {siteStats.map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse px-6 first:pl-0 sm:px-8">
                <dt className="mt-0.5 text-sm text-muted-foreground">{stat.label}</dt>
                <dd className="text-3xl font-bold tracking-tight">{stat.value}</dd>
              </div>
            ))}
          </dl>

          {/* mobile: the photo becomes a card under the copy */}
          <div className="relative mt-10 aspect-[4/5] overflow-hidden rounded-3xl md:hidden">
            <Image src={HERO_PHOTO} alt="" fill sizes="100vw" className="object-cover object-[center_25%]" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
            <HeroOverlay />
          </div>
        </div>
      </div>
    </section>
  );
}

function Goals() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h2 className="font-display text-3xl sm:text-4xl">Workouts for every goal</h2>
          <p className="mt-2 text-muted-foreground">From heavy barbells to deep stretches, find a coach for what moves you.</p>
        </div>
        <p aria-hidden className="font-display pointer-events-none -mt-16 hidden select-none text-right text-6xl uppercase leading-[0.9] text-foreground/[0.07] lg:block">
          Discipline
          <br />
          builds freedom
        </p>
      </div>
      <div className="mt-10 grid grid-cols-4 gap-y-8 sm:grid-cols-8">
        {GOALS.map((goal) => (
          <Link key={goal.key} href={`/programs?goal=${goal.key}`} className="group flex flex-col items-center gap-3">
            <IconChip icon={GOAL_ICONS[goal.key]} />
            <span className="text-center text-sm text-muted-foreground transition group-hover:text-foreground">{goal.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="relative overflow-hidden border-y border-border/60">
      <div className="pointer-events-none absolute right-0 top-0 size-[500px] rounded-full bg-primary/10 blur-[140px]" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 py-20 sm:px-6 lg:grid-cols-2">
        <PhoneMockups />

        <div>
          <p className="eyebrow">How GuildFit works</p>
          <h2 className="font-display mt-3 text-4xl sm:text-5xl">
            Your personal trainer.
            <br />
            In your pocket.
          </h2>
          <p className="mt-5 max-w-lg text-muted-foreground">
            One membership unlocks every program. Message your coach anytime, and book a private video session when you want a
            closer look at your form.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { icon: TrendingUp, label: "Track progress" },
              { icon: CirclePlay, label: "Video programs" },
              { icon: MessageCircle, label: "Chat with coaches" },
              { icon: Video, label: "1:1 video calls" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5 text-sm font-medium">
                <Icon className="size-5 shrink-0 text-primary" /> {label}
              </div>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Link href="/pricing" className={buttonVariants({ size: "lg", className: "h-12 px-6 text-base font-semibold" })}>
              See membership <ArrowRight />
            </Link>
            <p className="font-script -rotate-3 text-4xl text-primary">Small steps. Big changes.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function PhoneMockups() {
  return (
    <div className="relative mx-auto flex h-[520px] w-full max-w-[520px] justify-center">
      {/* phone 1: dashboard */}
      <div className="absolute left-0 top-0 w-60 rotate-[-6deg] rounded-[2.5rem] border-[6px] border-zinc-800 bg-background p-4 shadow-2xl shadow-black/60">
        <p className="text-[10px] font-bold">Guild<span className="text-primary">Fit</span></p>
        <p className="mt-4 text-xs text-muted-foreground">Good morning, Ada</p>
        <p className="text-lg font-bold leading-tight">You&apos;ve got this!</p>
        <div className="my-5 flex justify-center">
          <ProgressRing value={78} size={130} label="Weekly goal" />
        </div>
        <div className="grid grid-cols-3 gap-1 text-center">
          {[["Workouts", "4/5"], ["Minutes", "186"], ["Streak", "12d"]].map(([k, v]) => (
            <div key={k}>
              <p className="text-[10px] text-muted-foreground">{k}</p>
              <p className="text-sm font-bold">{v}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-lg bg-primary py-2.5 text-center text-xs font-bold text-primary-foreground">Start workout</div>
      </div>

      {/* phone 2: lesson */}
      <div className="absolute right-0 top-14 w-60 rotate-[5deg] overflow-hidden rounded-[2.5rem] border-[6px] border-zinc-800 bg-background shadow-2xl shadow-black/60">
        <div className="relative aspect-[4/3]">
          <Image src={photo("1517963879433-6ad2b056d712", 600)} alt="" fill sizes="240px" className="object-cover" />
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid size-11 place-items-center rounded-full bg-white/90 text-black"><Play className="size-4 fill-current" /></span>
          </span>
        </div>
        <div className="space-y-3 p-4">
          <p className="text-sm font-bold">Barbell Foundations</p>
          <p className="text-[10px] text-muted-foreground">6 lessons · Beginner</p>
          {[["Welcome & setup", true], ["The perfect squat", true], ["Deadlift basics", false]].map(([title, done]) => (
            <div key={String(title)} className="flex items-center gap-2 rounded-md bg-card px-2.5 py-2 text-[11px]">
              <CircleCheck className={done ? "size-3.5 text-primary" : "size-3.5 text-muted-foreground"} />
              {title}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
      <SectionHeading title="Real people. Real results." subtitle="Join thousands who've transformed their lives with GuildFit." />
      <div className="grid gap-5 md:grid-cols-3">
        {testimonials.map((t) => (
          <figure key={t.name} className="flex gap-4 rounded-2xl border border-border bg-card p-5">
            <UserAvatar src={t.image} name={t.name} size={64} />
            <div className="flex flex-1 flex-col">
              <blockquote className="text-sm leading-relaxed text-foreground/85">“{t.quote}”</blockquote>
              <figcaption className="mt-4 flex items-end justify-between gap-2">
                <span>
                  <span className="block text-sm font-semibold">{t.name}</span>
                  <span className="text-xs text-muted-foreground">{t.result}</span>
                </span>
                <Stars />
              </figcaption>
            </div>
          </figure>
        ))}
      </div>
    </section>
  );
}

function Community() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
      <div className="relative flex flex-col items-center gap-6 overflow-hidden rounded-2xl border border-border bg-card p-6 md:flex-row md:p-0 md:pr-8">
        <div className="relative hidden h-40 w-72 shrink-0 md:block">
          <Image src={photo("1594882645126-14020914d58d", 800)} alt="" fill sizes="288px" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-bold sm:text-3xl">Join the GuildFit community</h2>
          <p className="mt-1 flex items-center justify-center gap-2 text-sm text-muted-foreground md:justify-start">
            <Users className="size-4 text-primary" /> Fitness tips, new programs and member-only offers, straight to your inbox.
          </p>
        </div>
        <NewsletterForm />
      </div>
    </section>
  );
}
