"use client";

import { useActionState, useEffect } from "react";
import { CircleAlert, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { TrainerFields } from "@/components/trainer-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Uploader } from "@/components/uploader";
import type { Trainer } from "@/lib/types";
import { updateTrainerProfile, type ProfileState } from "../actions";

export function ProfileForm({ trainer }: { trainer: Trainer }) {
  const [state, formAction, pending] = useActionState<ProfileState, FormData>(updateTrainerProfile, {});
  useEffect(() => {
    if (state.ok) toast.success("Profile saved");
  }, [state]);

  return (
    <form action={formAction} className="space-y-6 rounded-2xl border border-border bg-card p-6">
      <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-end">
        <Uploader kind="image" label="Profile photo" compact defaultPreview={trainer.image} hint="Uploads go live with ImageKit" />
        <div className="space-y-1.5">
          <Label htmlFor="name">Display name</Label>
          <Input id="name" name="name" defaultValue={trainer.name} className="h-11" required maxLength={80} />
        </div>
      </div>
      <TrainerFields defaults={trainer} />
      {state.error && (
        <p role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
          <CircleAlert className="mt-0.5 size-4 shrink-0" /> {state.error}
        </p>
      )}
      <Button type="submit" size="lg" className="h-11 px-6 font-semibold" disabled={pending}>
        {pending && <Loader2 className="animate-spin" />} Save profile
      </Button>
    </form>
  );
}
