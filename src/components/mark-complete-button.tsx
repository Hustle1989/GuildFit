"use client";

import { useState } from "react";
import { CircleCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function MarkCompleteButton() {
  const [done, setDone] = useState(false);
  return (
    <Button
      size="lg"
      variant={done ? "secondary" : "default"}
      className="h-11 px-5 font-semibold"
      onClick={() => {
        setDone((d) => !d);
        if (!done) toast.success("Nice work! Lesson complete 💪");
      }}
    >
      <CircleCheck /> {done ? "Completed" : "Mark complete"}
    </Button>
  );
}
