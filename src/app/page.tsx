import Link from "next/link";
import { ArrowRight, CalendarCheck, MessageCircle, PlayCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ProgramCard, TrainerCard } from "@/components/cards";
import { listPrograms, listTrainers } from "@/lib/queries";
import { formatNaira, MEMBERSHIP_PRICE_KOBO } from "@/lib/utils";

export default async function HomePage() {
  const [trainers, programs] = await Promise.all([listTrainers(), listPrograms()]);

  return (
    <div>
      <section className="relative overflow-hidden border-b">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.9_0.21_125/0.18),transparent_55%)]" />
        <div className="relative mx-auto max-w-6xl px-4 py-24 sm:py-32">
          <p className="mb-6 inline-flex rounded-full border px-3 py-1 text-xs text-muted-foreground">
            Programs · Chat · 1:1 video coaching
          </p>
          <h1 className="font-display max-w-4xl text-5xl sm:text-7xl">
            Train with coaches who <span className="text-primary">actually</span> show up.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            One membership unlocks every program on GuildFit. Message your coach anytime, and book private
            video sessions when you need a closer look.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/trainers" className={buttonVariants({ size: "lg", className: "h-11 px-5" })}>
              Find your trainer <ArrowRight />
            </Link>
            <Link href="/pricing" className={buttonVariants({ size: "lg", variant: "outline", className: "h-11 px-5" })}>
              Membership · {formatNaira(MEMBERSHIP_PRICE_KOBO)}/mo
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-16 sm:grid-cols-3">
        {[
          { icon: PlayCircle, title: "Watch premium programs", text: "Structured video lessons from real coaches. First lesson of every program is free." },
          { icon: MessageCircle, title: "Chat with your coach", text: "Threads, replies and reactions, so feedback never gets lost." },
          { icon: CalendarCheck, title: "Book 1:1 video sessions", text: "Pick a slot, pay securely with Paystack, and join the call in-app." },
        ].map(({ icon: Icon, title, text }) => (
          <div key={title} className="rounded-2xl border bg-card p-6">
            <Icon className="mb-4 size-6 text-primary" />
            <h3 className="font-semibold">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{text}</p>
          </div>
        ))}
      </section>

      {trainers.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <SectionHeading title="Featured trainers" href="/trainers" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {trainers.slice(0, 4).map((t) => (
              <TrainerCard key={t.id} trainer={t} />
            ))}
          </div>
        </section>
      )}

      {programs.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-24">
          <SectionHeading title="Popular programs" href="/programs" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {programs.slice(0, 3).map((p) => (
              <ProgramCard key={p.id} program={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SectionHeading({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-6 flex items-end justify-between">
      <h2 className="font-display text-3xl sm:text-4xl">{title}</h2>
      <Link href={href} className="text-sm text-muted-foreground hover:text-primary">
        View all →
      </Link>
    </div>
  );
}
