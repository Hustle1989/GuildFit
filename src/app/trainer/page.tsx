import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, CalendarPlus, CirclePlay, Plus, Users, Video, Wallet } from "lucide-react";
import { InitialsAvatar, Panel, PanelLink, StatTile, StatusPill } from "@/components/app-ui";
import { EarningsChart } from "@/components/earnings-chart";
import { LiveBookings } from "@/components/live-bookings";
import { buttonVariants } from "@/components/ui/button";
import { countProgramEnrollments, getWeeklyEarnings, listProgramsByTrainer, listTrainerClients, listTrainerSlots } from "@/lib/queries";
import { loadLiveBookings } from "@/lib/realtime";
import { requireTrainer } from "@/lib/session";
import { dateParts, formatDate, formatNaira, greeting, isWithinDays, PLATFORM_FEE_PERCENT, sessionState } from "@/lib/utils";

export const metadata: Metadata = { title: "Trainer studio" };

export default async function TrainerOverviewPage() {
  const user = await requireTrainer();
  const [weekly, myPrograms, slots, clients, enrollments, newEnrollments, live] = await Promise.all([
    getWeeklyEarnings(user.id),
    listProgramsByTrainer(user.id, { includeDrafts: true }),
    listTrainerSlots(user.id),
    listTrainerClients(user.id),
    countProgramEnrollments(user.id),
    countProgramEnrollments(user.id, 7),
    loadLiveBookings(user.id),
  ]);

  const total = weekly.reduce((sum, w) => sum + w.netKobo, 0);
  const firstHalf = weekly.slice(0, 4).reduce((sum, w) => sum + w.netKobo, 0);
  const growth = firstHalf ? Math.round(((total - 2 * firstHalf) / firstHalf) * 100) : 0;
  const upcoming = slots.filter((s) => s.status === "booked" && sessionState(s.startsAt, s.durationMin) !== "ended");
  const next = upcoming[0] && dateParts(upcoming[0].startsAt);
  const newClients = clients.filter((c) => isWithinDays(c.lastActive, 7)).length;

  return (
    <div className="space-y-5">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {greeting()}, {user.name.split(" ")[0]}
          </h1>
          <p className="mt-1.5 text-muted-foreground">Here&apos;s how your coaching business is doing.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/trainer/availability" className={buttonVariants({ variant: "outline", className: "h-9 px-3.5" })}>
            <CalendarPlus /> Add slots
          </Link>
          <Link href="/trainer/programs/new" className={buttonVariants({ className: "h-9 px-3.5 font-semibold" })}>
            <Plus /> New program
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatTile
          label="Earnings · 8 weeks"
          value={formatNaira(total)}
          icon={Wallet}
          delta={firstHalf ? `${growth >= 0 ? "+" : ""}${growth}% in the last 4 weeks` : "After the 10% platform fee"}
        />
        <StatTile label="Program enrollments" value={enrollments.toLocaleString()} icon={CirclePlay} delta={`+${newEnrollments} this week`} />
        <StatTile
          label="Upcoming sessions"
          value={String(upcoming.length)}
          icon={CalendarDays}
          delta={next ? `Next: ${next.weekdayShort} ${next.time}` : "Nothing booked yet"}
        />
        <StatTile label="Active clients" value={String(clients.length)} icon={Users} delta={`${newClients} active this week`} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.65fr_1fr]">
        <section className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold">Earnings</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">Net per week, after the {PLATFORM_FEE_PERCENT}% platform fee</p>
            </div>
            <p className="text-2xl font-bold tracking-tight tabular-nums">{formatNaira(total)}</p>
          </div>
          <EarningsChart data={weekly.map((w) => ({ label: formatDate(w.weekStart, "short"), netKobo: w.netKobo }))} />
        </section>
        <LiveBookings key={live.sealedQuery.queryFingerprint} userId={user.id} initialData={live.initialData} sealedQuery={live.sealedQuery} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Upcoming sessions" action={<PanelLink href="/trainer/availability">Manage slots</PanelLink>}>
          {upcoming.length === 0 ? (
            <p className="border-t border-border/60 px-5 py-10 text-center text-sm text-muted-foreground">No sessions booked yet. Add slots so clients can book.</p>
          ) : (
            <ul className="divide-y divide-border/60 border-t border-border/60">
              {upcoming.slice(0, 3).map((s) => (
                <li key={s.id} className="flex items-center gap-3 px-5 py-3">
                  <InitialsAvatar name={s.client!.name} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{s.client!.name}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(s.startsAt)}</p>
                  </div>
                  <Link
                    href={`/trainer/sessions/${s.bookingId}`}
                    className={buttonVariants({ variant: "outline", className: "h-8 gap-1.5 px-3 text-xs font-medium" })}
                  >
                    <Video className="size-3.5" /> Join call
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Your programs" action={<PanelLink href="/trainer/programs">View all</PanelLink>}>
          {myPrograms.length === 0 ? (
            <p className="border-t border-border/60 px-5 py-10 text-center text-sm text-muted-foreground">
              No programs yet. <Link href="/trainer/programs/new" className="font-medium text-primary hover:underline">Create your first one</Link>.
            </p>
          ) : (
            <ul className="divide-y divide-border/60 border-t border-border/60">
              {myPrograms.map((p) => (
                <li key={p.id}>
                  <Link href={`/trainer/programs/${p.id}`} className="flex items-center gap-3 px-5 py-3 transition hover:bg-foreground/[0.03]">
                    <span className="relative h-10 w-14 shrink-0 overflow-hidden rounded-md">
                      <Image src={p.image} alt="" fill sizes="112px" className="object-cover" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{p.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.lessons.length} lessons · {p.enrolled.toLocaleString()} enrolled
                      </p>
                    </div>
                    <StatusPill tone="muted">{p.published ? "Published" : "Draft"}</StatusPill>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
