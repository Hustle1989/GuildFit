import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProgramForm } from "@/components/program-form";
import { currentTrainer, programById } from "@/lib/mock-data";

export const metadata: Metadata = { title: "Edit program" };

export default async function EditProgramPage({ params }: PageProps<"/trainer/programs/[id]">) {
  const { id } = await params;
  const program = programById(id);
  if (!program || program.trainerId !== currentTrainer.id) notFound();

  return <ProgramForm program={program} />;
}
