import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/submit-button";
import { createProgram } from "../actions";
import { ProgramFields } from "../program-fields";

export default function NewProgramPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">New program</h1>
      <ActionForm action={createProgram} className="space-y-6">
        <ProgramFields />
        <SubmitButton size="lg">Create program</SubmitButton>
      </ActionForm>
    </div>
  );
}
