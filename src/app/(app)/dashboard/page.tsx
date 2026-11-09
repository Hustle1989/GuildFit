import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, CalendarX, CirclePlay } from "lucide-react";
import { StatusPill } from "@/components/app-ui";
import { SessionCard } from "@/components/session-row";
import { EmptyState } from "@/components/shared";
import { buttonVariants } from "@/components/ui/button";
import { getLibrary, getMembership, isMembershipActive, listClientSessions } from "@/lib/queries";
import { requireClient } from "@/lib/session";
import { formatDate, formatNaira, MEMBERSHIP_PRICE_KOBO, sessionState } from "@/lib/utils";

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

export default async function LibraryPage() {
  const user = await requireClient();
  const [sessions, membership, library] = await Promise.all([listClientSessions(user.id), getMembership(user.id), getLibrary(user.id)]);
  const upcoming = sessions.filter((b) => sessionState(b.startsAt, b.durationMin) !== "ended");
  const member = isMembershipActive(membership);

  return (
    <>
      <p className="eyebrow">My Library</p>
      <h1 className="font-display mt-4 text-4xl sm:text-5xl">Welcome back, {user.name.split(" ")[0]}</h1>
      <p className="mt-3 text-muted-foreground">Your programs and upcoming sessions, all in one place.</p>

      <section className="mt-12">
        <SectionTitle title="Upcoming sessions" href="/sessions" linkLabel="All sessions" />
        {upcoming.length ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {upcoming.map((b) => (
              <SessionCard key={b.id} id={b.id} person={b.trainer} startsAt={b.startsAt} durationMin={b.durationMin} />
            ))}
          </div>
        ) : (
          <EmptyState icon={CalendarX} title="No sessions booked" description="Book a 1:1 video call from any coach's profile." />
        )}
      </section>

      <section className="mt-12">
        <SectionTitle title="My programs" href="/programs" linkLabel="Explore programs" />
        {library.length === 0 && (
          <EmptyState icon={CirclePlay} title="No programs yet" description="Open any program and start its first lesson. It'll show up here with your progress." />
        )}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {library.map(({ program, completed }) => {
            const trainer = program.trainer;
            const next = program.lessons[Math.min(completed, program.lessons.length - 1)];
            const pct = Math.round((completed / program.lessons.length) * 100);
            return (
              <Link
                key={program.id}
                href={`/programs/${program.slug}/lessons/${next.id}`}
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
            <p className="font-semibold">GuildFit Monthly</p>
            {member ? (
              <StatusPill tone="green" dot>
                {membership!.status === "active" ? "Active" : "Cancelled"}
              </StatusPill>
            ) : (
              <StatusPill tone="muted">Not a member</StatusPill>
            )}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {member
              ? `Every program unlocked · ${formatNaira(MEMBERSHIP_PRICE_KOBO)}/month · ${membership!.status === "active" ? "renews" : "access until"} ${formatDate(membership!.currentPeriodEnd, "short")}`
              : `Unlock every lesson in every program for ${formatNaira(MEMBERSHIP_PRICE_KOBO)}/month.`}
          </p>
        </div>
        <Link href={member ? "/billing" : "/pricing"} className={buttonVariants({ variant: member ? "outline" : "default", className: "h-9 px-4" })}>
          {member ? "Manage membership" : "Become a member"}
        </Link>
      </section>
    </>
  );
}
