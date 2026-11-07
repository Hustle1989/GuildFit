import { TrainerShell } from "@/components/trainer-shell";
import { currentTrainer } from "@/lib/mock-data";

export default function TrainerLayout({ children }: { children: React.ReactNode }) {
  return (
    <TrainerShell user={{ name: currentTrainer.name, image: currentTrainer.image }} publicHref={`/trainers/${currentTrainer.slug}`}>
      {children}
    </TrainerShell>
  );
}
