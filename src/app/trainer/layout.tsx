import { TrainerShell } from "@/components/trainer-shell";
import { getTrainerById } from "@/lib/queries";
import { requireTrainer } from "@/lib/session";

/** Trainer studio: signed-in trainers only. */
export default async function TrainerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireTrainer();
  const trainer = await getTrainerById(user.id);
  return (
    <TrainerShell user={{ name: user.name, image: trainer?.image ?? user.image }} publicHref={trainer ? `/trainers/${trainer.slug}` : "/trainers"}>
      {children}
    </TrainerShell>
  );
}
