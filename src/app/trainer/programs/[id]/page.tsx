import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProgramForm } from "@/components/program-form";
import { getOwnedProgram } from "@/lib/queries";
import { requireTrainer } from "@/lib/session";

export const metadata: Metadata = { title: "Edit program" };

export default async function EditProgramPage({ params }: PageProps<"/trainer/programs/[id]">) {
  const user = await requireTrainer();
  const program = await getOwnedProgram((await params).id, user.id);
  if (!program) notFound();

  return <ProgramForm key={program.id} program={program} />;
}
