import type { Metadata } from "next";
import Link from "next/link";
import { CalendarX, Plus } from "lucide-react";
import { PageHeader } from "@/components/app-ui";
import { SessionCard } from "@/components/session-row";
import { EmptyState } from "@/components/shared";
import { buttonVariants } from "@/components/ui/button";
import { listClientSessions } from "@/lib/queries";
import { requireClient } from "@/lib/session";
import { sessionState } from "@/lib/utils";

export const metadata: Metadata = { title: "My sessions" };

export default async function SessionsPage() {
  const user = await requireClient();
  const bookings = await listClientSessions(user.id);
  const upcoming = bookings.filter((b) => sessionState(b.startsAt, b.durationMin) !== "ended");
  const past = bookings.filter((b) => sessionState(b.startsAt, b.durationMin) === "ended").reverse();

  const card = (b: (typeof bookings)[number]) => (
    <SessionCard key={b.id} id={b.id} person={b.trainer} startsAt={b.startsAt} durationMin={b.durationMin} amountKobo={b.amountKobo} />
  );

  return (
    <>
      <PageHeader eyebrow="My Library" title="My sessions" subtitle="Private 1:1 video sessions with your coaches.">
        <Link href="/trainers" className={buttonVariants({ className: "h-9 px-4 font-semibold" })}>
          <Plus /> Book a session
        </Link>
      </PageHeader>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Upcoming</h2>
        {upcoming.length ? (
          upcoming.map(card)
        ) : (
          <EmptyState icon={CalendarX} title="No upcoming sessions" description="Book a 1:1 video session from any coach's profile." />
        )}
      </section>

      <section className="mt-12 space-y-3">
        <h2 className="text-xl font-semibold">Past</h2>
        {past.length ? past.map(card) : <p className="text-sm text-muted-foreground">No past sessions yet.</p>}
      </section>
    </>
  );
}
