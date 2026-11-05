import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarX, MessageCircle } from "lucide-react";
import { ActionForm } from "@/components/action-form";
import { ProgramCard } from "@/components/cards";
import { Cover } from "@/components/cover";
import { EmptyState } from "@/components/empty-state";
import { LocalTime } from "@/components/local-time";
import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getTrainerBySlug, listOpenSlots, listPrograms } from "@/lib/queries";
import { getCurrentUser } from "@/lib/session";
import { formatNaira } from "@/lib/utils";
import { bookSlot, startChat } from "./actions";

export async function generateMetadata({ params }: PageProps<"/trainers/[slug]">): Promise<Metadata> {
  const trainer = await getTrainerBySlug((await params).slug);
  if (!trainer) return {};
  return {
    title: `${trainer.name}, personal trainer`,
    description: trainer.headline,
    openGraph: { images: trainer.coverUrl ? [trainer.coverUrl] : [] },
  };
}

export default async function TrainerPage({ params }: PageProps<"/trainers/[slug]">) {
  const trainer = await getTrainerBySlug((await params).slug);
  if (!trainer) notFound();

  const [user, programs, openSlots] = await Promise.all([
    getCurrentUser(),
    listPrograms({ trainerId: trainer.id }),
    listOpenSlots(trainer.id),
  ]);
  const isSelf = user?.id === trainer.id;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Cover src={trainer.coverUrl ?? trainer.avatarUrl} alt={trainer.name} priority className="aspect-[4/5] rounded-3xl border" />

        <div className="space-y-6">
          <div>
            <div className="mb-3 flex flex-wrap gap-1.5">
              {trainer.specialties.map((s) => (
                <Badge key={s} variant="secondary">{s}</Badge>
              ))}
            </div>
            <h1 className="font-display text-5xl sm:text-6xl">{trainer.name}</h1>
            <p className="mt-3 text-lg text-muted-foreground">{trainer.headline}</p>
          </div>
          <p className="whitespace-pre-line leading-relaxed text-foreground/85">{trainer.bio}</p>

          {!isSelf &&
            (user ? (
              <ActionForm action={startChat}>
                <input type="hidden" name="trainerId" value={trainer.id} />
                <SubmitButton variant="outline" size="lg" className="h-11 px-5">
                  <MessageCircle /> Message {trainer.name.split(" ")[0]}
                </SubmitButton>
              </ActionForm>
            ) : (
              <Link href="/sign-in" className={buttonVariants({ variant: "outline", size: "lg", className: "h-11 px-5" })}>
                <MessageCircle /> Sign in to message
              </Link>
            ))}

          <section className="rounded-2xl border bg-card p-5">
            <h2 className="mb-1 text-xl font-bold">Book a 1:1 video session</h2>
            <p className="mb-4 text-sm text-muted-foreground">Pay securely with Paystack. No membership needed.</p>
            {openSlots.length === 0 ? (
              <EmptyState icon={CalendarX} title="No open slots right now" description="Message the trainer to ask about availability." />
            ) : (
              <ul className="divide-y">
                {openSlots.map((slot) => (
                  <li key={slot.id} className="flex items-center justify-between gap-4 py-3">
                    <div>
                      <p className="font-medium"><LocalTime date={slot.startsAt} /></p>
                      <p className="text-sm text-muted-foreground">
                        {slot.durationMin} min · {formatNaira(slot.priceKobo)}
                      </p>
                    </div>
                    {isSelf ? (
                      <Badge variant="outline">Your slot</Badge>
                    ) : user ? (
                      <ActionForm action={bookSlot}>
                        <input type="hidden" name="slotId" value={slot.id} />
                        <SubmitButton>Book</SubmitButton>
                      </ActionForm>
                    ) : (
                      <Link href="/sign-in" className={buttonVariants()}>Sign in to book</Link>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      {programs.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display mb-6 text-3xl">Programs by {trainer.name.split(" ")[0]}</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {programs.map((p) => (
              <ProgramCard key={p.id} program={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
