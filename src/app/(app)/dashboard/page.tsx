import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, CalendarX } from "lucide-react";
import { StatusPill } from "@/components/app-ui";
import { SessionCard } from "@/components/session-row";
import { EmptyState } from "@/components/shared";
import { buttonVariants } from "@/components/ui/button";
import { currentClient, getMembership, getMyBookings, myPrograms, programById, trainerById } from "@/lib/mock-data";
import { formatDate, formatNaira, sessionState } from "@/lib/utils";

export const metadata: Metadata = { title: "My Library" };

function SectionTitle({ title, href, linkLabel }: { title: string; href: string; linkLabel: string }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <Link href={href} className="group flex items-center gap-1 text-sm font-medium text-primary">
        {linkLabel} <ArrowRight className="size-4 transition group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

export default function LibraryPage() {
  const upcoming = getMyBookings().filter((b) => sessionState(b.startsAt, b.durationMin) !== "ended");
  const membership = getMembership();
  const library = myPrograms.map((mp) => ({ ...mp, program: programById(mp.programId)! }));

  return (
    <>
      <p className="eyebrow">My Library</p>
      <h1 className="font-display mt-4 text-4xl sm:text-5xl">Welcome back, {currentClient.name.split(" ")[0]}</h1>
      <p className="mt-3 text-muted-foreground">Your programs and upcoming sessions, all in one place.</p>

      <section className="mt-12">
        <SectionTitle title="Upcoming sessions" href="/sessions" linkLabel="All sessions" />
        {upcoming.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {upcoming.map((b) => {
              const t = trainerById(b.trainerId)!;
              return <SessionCard key={b.id} id={b.id} person={t} startsAt={b.startsAt} durationMin={b.durationMin} />;
            })}
          </div>
        ) : (
          <EmptyState icon={CalendarX} title="No sessions booked" description="Book a 1:1 video call from any coach's profile." />
        )}
      </section>

      <section className="mt-12">
        <SectionTitle title="My programs" href="/programs" linkLabel="Explore programs" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {library.map(({ program, completed }) => {
            const trainer = trainerById(program.trainerId);
            const next = program.lessons[Math.min(completed, program.lessons.length - 1)];
            const pct = Math.round((completed / program.lessons.length) * 100);
            return (
              <Link
                key={program.id}
                href={`/programs/${program.slug}/lessons/${next.id}?view=member`}
                className="group relative block aspect-[5/4] overflow-hidden rounded-2xl border border-border bg-card"
              >
                <Image
                  src={program.image}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />
                <span className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
                  {program.lessons.length} lessons
                </span>
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <p className="text-lg font-semibold leading-tight">{program.title}</p>
                  <p className="mt-0.5 truncate text-sm text-white/70">
                    {trainer?.name} · Next: {next.title}
                  </p>
                  <div className="mt-3 flex items-center gap-3 text-xs text-white/80">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/20">
                      <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                    {completed}/{program.lessons.length}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-12 flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-5">
        <span className="grid size-11 place-items-center rounded-xl border border-primary/20 bg-primary/10 text-primary">
          <BadgeCheck className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{membership.plan}</p>
            <StatusPill tone="green" dot>
              Active
            </StatusPill>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Every program unlocked · {formatNaira(membership.priceKobo)}/month · renews {formatDate(membership.renewsAt, "short")}
          </p>
        </div>
        <Link href="/billing" className={buttonVariants({ variant: "outline", className: "h-9 px-4" })}>
          Manage membership
        </Link>
      </section>
    </>
  );
}
