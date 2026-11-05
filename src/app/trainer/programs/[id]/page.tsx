import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, eq } from "drizzle-orm";
import { ArrowDown, ArrowUp, ExternalLink, Trash2, VideoOff } from "lucide-react";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/submit-button";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Uploader } from "@/components/uploader";
import { db, lessons, programs } from "@/db";
import { requireTrainer } from "@/lib/session";
import { addLesson, deleteLesson, moveLesson, togglePublish, updateProgram } from "../actions";
import { ProgramFields } from "../program-fields";

export default async function EditProgramPage({ params }: PageProps<"/trainer/programs/[id]">) {
  const user = await requireTrainer();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();

  const [program] = await db
    .select()
    .from(programs)
    .where(and(eq(programs.id, id), eq(programs.trainerId, user.id)));
  if (!program) notFound();
  const lessonList = await db.select().from(lessons).where(eq(lessons.programId, program.id)).orderBy(asc(lessons.position));

  return (
    <div className="space-y-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">{program.title}</h1>
          <Badge variant={program.published ? "default" : "outline"}>{program.published ? "Live" : "Draft"}</Badge>
        </div>
        <div className="flex gap-2">
          <Link href={`/programs/${program.slug}`} className={buttonVariants({ variant: "ghost" })}>
            <ExternalLink /> View
          </Link>
          <ActionForm action={togglePublish} successMessage={program.published ? "Program unpublished" : "Program is live!"}>
            <input type="hidden" name="programId" value={program.id} />
            <SubmitButton variant={program.published ? "secondary" : "default"}>
              {program.published ? "Unpublish" : "Publish"}
            </SubmitButton>
          </ActionForm>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Lessons</h2>
          {lessonList.length === 0 ? (
            <p className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
              No lessons yet. The first lesson you add is the free preview.
            </p>
          ) : (
            <ol className="divide-y rounded-2xl border bg-card">
              {lessonList.map((lesson, i) => (
                <li key={lesson.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                  <span className="w-5 text-muted-foreground">{i + 1}</span>
                  <span className="flex-1">
                    {lesson.title}
                    {i === 0 && <Badge variant="secondary" className="ml-2">Free preview</Badge>}
                    {!lesson.videoPath && <VideoOff className="ml-2 inline size-3.5 text-muted-foreground" />}
                  </span>
                  <LessonButton action={moveLesson} programId={program.id} lessonId={lesson.id} direction="up" disabled={i === 0} label="Move up">
                    <ArrowUp />
                  </LessonButton>
                  <LessonButton action={moveLesson} programId={program.id} lessonId={lesson.id} direction="down" disabled={i === lessonList.length - 1} label="Move down">
                    <ArrowDown />
                  </LessonButton>
                  <LessonButton action={deleteLesson} programId={program.id} lessonId={lesson.id} label="Delete lesson">
                    <Trash2 />
                  </LessonButton>
                </li>
              ))}
            </ol>
          )}

          {/* key resets the form (and its uploader) after each new lesson */}
          <ActionForm key={lessonList.length} action={addLesson} successMessage="Lesson added" className="space-y-4 rounded-2xl border p-5">
            <h3 className="font-semibold">Add a lesson</h3>
            <input type="hidden" name="programId" value={program.id} />
            <div className="space-y-1.5">
              <Label htmlFor="lesson-title">Title</Label>
              <Input id="lesson-title" name="title" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lesson-notes">Notes (optional)</Label>
              <Textarea id="lesson-notes" name="notes" rows={3} />
            </div>
            <Uploader name="videoPath" kind="video" folder="/guildfit/lessons" label="Lesson video (private)" />
            <SubmitButton>Add lesson</SubmitButton>
          </ActionForm>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Details</h2>
          <ActionForm action={updateProgram} successMessage="Program saved" className="space-y-6">
            <input type="hidden" name="programId" value={program.id} />
            <ProgramFields defaults={program} />
            <SubmitButton>Save changes</SubmitButton>
          </ActionForm>
        </section>
      </div>
    </div>
  );
}

function LessonButton({
  action,
  programId,
  lessonId,
  direction,
  disabled,
  label,
  children,
}: {
  action: (formData: FormData) => Promise<{ error?: string; ok?: boolean }>;
  programId: string;
  lessonId: string;
  direction?: "up" | "down";
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <ActionForm action={action}>
      <input type="hidden" name="programId" value={programId} />
      <input type="hidden" name="lessonId" value={lessonId} />
      {direction && <input type="hidden" name="direction" value={direction} />}
      <SubmitButton variant="ghost" size="icon-sm" disabled={disabled} aria-label={label}>
        {children}
      </SubmitButton>
    </ActionForm>
  );
}
