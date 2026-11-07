import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Award, BadgeCheck, Briefcase, MapPin, MessageCircle, Users } from "lucide-react";
import { BookingCard } from "@/components/booking-card";
import { ProgramCard } from "@/components/cards";
import { GOAL_ICONS } from "@/components/shared";
import { buttonVariants } from "@/components/ui/button";
import { goalLabel, openSlotsFor, programsByTrainer, trainerBySlug } from "@/lib/mock-data";
import { formatNaira } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/trainers/[slug]">): Promise<Metadata> {
  const trainer = trainerBySlug((await params).slug);
  if (!trainer) return {};
  return { title: `${trainer.name}, ${trainer.title} coach`, description: trainer.headline, openGraph: { images: [trainer.image] } };
}

export default async function TrainerPage({ params }: PageProps<"/trainers/[slug]">) {
  const trainer = trainerBySlug((await params).slug);
  if (!trainer) notFound();
  const programs = programsByTrainer(trainer.id);
  const slots = openSlotsFor(trainer).map((s) => ({ ...s, startsAt: s.startsAt.toISOString() }));
  const firstName = trainer.name.split(" ")[0];

  return (
    <div className="relative">
      <div className="pointer-events-none absolute -top-20 right-0 size-[520px] rounded-full bg-primary/10 blur-[140px]" />

      <section className="relative mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:py-14">
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-border">
          <Image src={trainer.image} alt={trainer.name} fill priority sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
            <span className="size-2 rounded-full bg-primary" /> Usually replies within an hour
          </div>
        </div>

        <div className="flex flex-col">
          <p className="eyebrow">{trainer.title}</p>
          <h1 className="font-display mt-3 flex items-center gap-3 text-5xl sm:text-6xl">
            {trainer.name} <BadgeCheck className="size-8 shrink-0 text-primary" aria-label="Verified coach" />
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">{trainer.headline}</p>

          <dl className="mt-6 grid grid-cols-3 gap-3">
            {[
              { icon: Briefcase, label: "Experience", value: `${trainer.yearsExperience} years` },
              { icon: Users, label: "Clients coached", value: `${trainer.clients}+` },
              { icon: MapPin, label: "Based in", value: trainer.location },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="rounded-xl border border-border bg-card p-3 sm:p-4">
                <Icon className="mb-2 size-4 text-primary" />
                <dd className="font-bold">{value}</dd>
                <dt className="text-xs text-muted-foreground">{label}</dt>
              </div>
            ))}
          </dl>

          <div className="mt-6 flex flex-wrap gap-2">
            {trainer.goals.map((g) => {
              const Icon = GOAL_ICONS[g];
              return (
                <span key={g} className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm">
                  <Icon className="size-4 text-primary" /> {goalLabel(g)}
                </span>
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href="#book" className={buttonVariants({ size: "lg", className: "h-12 px-6 text-base font-semibold" })}>
              Book from {formatNaira(trainer.sessionPriceKobo)}
            </a>
            <Link href="/messages" className={buttonVariants({ size: "lg", variant: "outline", className: "h-12 px-6 text-base" })}>
              <MessageCircle /> Message {firstName}
            </Link>
          </div>

          <div className="mt-10 space-y-4 text-foreground/80">
            <h2 className="text-lg font-bold text-foreground">About {firstName}</h2>
            {trainer.bio.split("\n\n").map((para) => (
              <p key={para.slice(0, 20)} className="leading-relaxed">{para}</p>
            ))}
          </div>

          <ul className="mt-6 space-y-2">
            {trainer.certifications.map((c) => (
              <li key={c} className="flex items-center gap-2 text-sm">
                <Award className="size-4 text-primary" /> {c}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="book" className="relative mx-auto grid max-w-7xl scroll-mt-24 gap-10 px-4 pb-16 sm:px-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div>
          <h2 className="font-display text-3xl">Programs by {firstName}</h2>
          <p className="mt-2 text-muted-foreground">Included with your GuildFit membership.</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {programs.map((p) => (
              <ProgramCard key={p.id} program={p} />
            ))}
          </div>
        </div>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <BookingCard slots={slots} trainerName={trainer.name} />
        </div>
      </section>
    </div>
  );
}
