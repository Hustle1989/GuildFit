import type { Metadata } from "next";
import { ProgramForm } from "@/components/program-form";

export const metadata: Metadata = { title: "New program" };

export default function NewProgramPage() {
  return <ProgramForm />;
}
