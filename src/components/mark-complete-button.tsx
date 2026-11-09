"use client";

import { useOptimistic, useTransition } from "react";
import { CircleCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { setLessonComplete } from "@/lib/actions";

/** Saves lesson progress in Postgres; the button flips immediately. */
export function MarkCompleteButton({ lessonId, done }: { lessonId: string; done: boolean }) {
  const [optimisticDone, setOptimisticDone] = useOptimistic(done);
  const [, startTransition] = useTransition();

  return (
    <Button
      size="lg"
      variant={optimisticDone ? "secondary" : "default"}
      className="h-11 px-5 font-semibold"
      onClick={() =>
        startTransition(async () => {
          const next = !optimisticDone;
          setOptimisticDone(next);
          await setLessonComplete(lessonId, next);
          if (next) toast.success("Nice work! Lesson complete 💪");
        })
      }
    >
      <CircleCheck /> {optimisticDone ? "Completed" : "Mark complete"}
    </Button>
  );
}
