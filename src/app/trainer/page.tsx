import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, CalendarPlus, CirclePlay, Plus, Users, Video, Wallet } from "lucide-react";
import { InitialsAvatar, Panel, PanelLink, StatTile, StatusPill } from "@/components/app-ui";
import { EarningsChart } from "@/components/earnings-chart";
import { LiveBookings, type FeedRow } from "@/components/live-bookings";
import { buttonVariants } from "@/components/ui/button";
import { currentTrainer, getClients, getRecentBookings, getTrainerSlots, getWeeklyEarnings, people, programs } from "@/lib/mock-data";
import { dateParts, formatDate, formatNaira, greeting, PLATFORM_FEE_PERCENT, sessionState } from "@/lib/utils";

export const metadata: Metadata = { title: "Trainer studio" };

const net = (grossKobo: number) => Math.round(grossKobo * (1 - PLATFORM_FEE_PERCENT / 100));

export default function TrainerOverviewPage() {
  const weekly = getWeeklyEarnings();
  const total = weekly.reduce((sum, w) => sum + w.netKobo, 0);
  const firstHalf = weekly.slice(0, 4).reduce((sum, w) => sum + w.netKobo, 0);
  const growth = Math.round(((total - 2 * firstHalf) / firstHalf) * 100);

  const myPrograms = programs.filter((p) => p.trainerId === currentTrainer.id);
  const slots = getTrainerSlots();
  const upcoming = slots.filter((s) => s.status === "booked" && sessionState(s.startsAt, s.durationMin) !== "ended");
  const next = upcoming[0] && dateParts(upcoming[0].startsAt);

  const feed: FeedRow[] = getRecentBookings().map((b) => ({
    id: b.id,
    name: people[b.clientId].name,
    paidAt: b.paidAt.toISOString(),
    durationMin: b.durationMin,
    netKobo: net(b.grossKobo),
  }));
  // The fake "realtime" arrival books one of Amara's open 60-minute slots.
  const openSlot = slots.find((s) => s.status === "open" && s.durationMin === 60)!;
  const incoming: FeedRow = { id: "incoming", name: people.u4.name, paidAt: openSlot.startsAt.toISOString(), durationMin: 60, netKobo: net(openSlot.priceKobo) };

  return (
    <div className="space-y-5">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {greeting()}, {currentTrainer.name.split(" ")[0]}
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
        <StatTile label="Earnings · 8 weeks" value={formatNaira(total)} icon={Wallet} delta={`+${growth}% in the last 4 weeks`} />
        <StatTile
          label="Program enrollments"
          value={myPrograms.reduce((s, p) => s + p.enrolled, 0).toLocaleString()}
          icon={CirclePlay}
          delta="+34 this week"
        />
        <StatTile
          label="Upcoming sessions"
          value={String(upcoming.length)}
          icon={CalendarDays}
          delta={next ? `Next: ${next.weekdayShort} ${next.time}` : "Nothing booked yet"}
        />
        <StatTile label="Active clients" value={String(getClients().length)} icon={Users} delta="+2 this week" />
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
        <LiveBookings rows={feed} incoming={incoming} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Upcoming sessions" action={<PanelLink href="/trainer/availability">Manage slots</PanelLink>}>
          <ul className="divide-y divide-border/60 border-t border-border/60">
            {upcoming.slice(0, 3).map((s) => {
              const client = people[s.clientId!];
              return (
                <li key={s.id} className="flex items-center gap-3 px-5 py-3">
                  <InitialsAvatar name={client.name} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{client.name}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(s.startsAt)}</p>
                  </div>
                  <Link
                    href={`/trainer/sessions/${s.id}`}
                    className={buttonVariants({ variant: "outline", className: "h-8 gap-1.5 px-3 text-xs font-medium" })}
                  >
                    <Video className="size-3.5" /> Join call
                  </Link>
                </li>
              );
            })}
          </ul>
        </Panel>

        <Panel title="Your programs" action={<PanelLink href="/trainer/programs">View all</PanelLink>}>
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
        </Panel>
      </div>
    </div>
  );
}
