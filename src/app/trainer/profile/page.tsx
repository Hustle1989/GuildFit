import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Users } from "lucide-react";
import { PageHeader } from "@/components/app-ui";
import { notFound } from "next/navigation";
import { getTrainerById } from "@/lib/queries";
import { requireTrainer } from "@/lib/session";
import { formatNaira } from "@/lib/utils";
import { ProfileForm } from "./profile-form";

export const metadata: Metadata = { title: "Profile" };

export default async function TrainerProfilePage() {
  const user = await requireTrainer();
  const t = await getTrainerById(user.id);
  if (!t) notFound();
  return (
    <>
      <PageHeader title="Public profile" subtitle="How clients see you on GuildFit." />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <ProfileForm trainer={t} />

        <aside className="space-y-3 lg:sticky lg:top-24 lg:self-start">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Card preview</p>
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-border">
            <Image src={t.image} alt={t.name} fill sizes="400px" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 space-y-2 p-5 text-white">
              <p className="eyebrow text-mint">{t.title}</p>
              <h3 className="text-2xl font-semibold">{t.name}</h3>
              <div className="flex gap-4 text-xs text-white/75">
                <span className="flex items-center gap-1"><MapPin className="size-3.5" /> {t.location}</span>
                <span className="flex items-center gap-1"><Users className="size-3.5" /> {t.clients}+ clients</span>
              </div>
              <p className="pt-2 text-sm">1:1 from <span className="text-mint font-semibold">{formatNaira(t.sessionPriceKobo)}</span></p>
            </div>
          </div>
          <Link href={`/trainers/${t.slug}`} className="block text-center text-sm font-semibold text-primary hover:underline">Open public page</Link>
        </aside>
      </div>
    </>
  );
}
