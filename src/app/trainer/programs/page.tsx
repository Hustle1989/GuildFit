import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { CirclePlay, Plus, Users } from "lucide-react";
import { PageHeader } from "@/components/app-ui";
import { buttonVariants } from "@/components/ui/button";
import { listProgramsByTrainer } from "@/lib/queries";
import { requireTrainer } from "@/lib/session";
import { goalLabel, totalMinutes } from "@/lib/types";

export const metadata: Metadata = { title: "Your programs" };

export default async function TrainerProgramsPage() {
  const user = await requireTrainer();
  const mine = await listProgramsByTrainer(user.id, { includeDrafts: true });

  return (
    <>
      <PageHeader title="Programs" subtitle="Create video programs. Members get every published program.">
        <Link href="/trainer/programs/new" className={buttonVariants({ className: "h-10 px-4 font-semibold" })}>
          <Plus /> New program
        </Link>
      </PageHeader>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {mine.map((p) => (
          <Link key={p.id} href={`/trainer/programs/${p.id}`} className="group overflow-hidden rounded-2xl border border-border bg-card transition hover:border-primary/40">
            <div className="relative aspect-video">
              <Image src={p.image} alt="" fill sizes="33vw" className="object-cover transition duration-500 group-hover:scale-105" />
              <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
                <span className={p.published ? "size-1.5 rounded-full bg-[oklch(0.84_0.19_152)]" : "size-1.5 rounded-full bg-amber-300"} />
                {p.published ? "Published" : "Draft"}
              </span>
            </div>
            <div className="space-y-2 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">{goalLabel(p.goal)} · <span className="capitalize">{p.level}</span></p>
              <p className="text-lg font-semibold">{p.title}</p>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><CirclePlay className="size-4" /> {p.lessons.length} lessons · {totalMinutes(p)} min</span>
                <span className="flex items-center gap-1.5"><Users className="size-4" /> {p.enrolled.toLocaleString()}</span>
              </div>
            </div>
          </Link>
        ))}

        <Link
          href="/trainer/programs/new"
          className="flex min-h-72 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-foreground/15 text-muted-foreground transition hover:border-primary hover:text-primary"
        >
          <span className="grid size-14 place-items-center rounded-full border border-current"><Plus className="size-6" /></span>
          <span className="font-semibold">Create a new program</span>
        </Link>
      </div>
    </>
  );
}
