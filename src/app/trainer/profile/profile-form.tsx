"use client";

import { toast } from "sonner";
import { TrainerFields } from "@/components/trainer-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Uploader } from "@/components/uploader";
import type { Trainer } from "@/lib/mock-data";

export function ProfileForm({ trainer }: { trainer: Trainer }) {
  return (
    <form
      className="space-y-6 rounded-2xl border border-border bg-card p-6"
      onSubmit={(e) => {
        e.preventDefault();
        toast.success("Profile saved");
      }}
    >
      <div className="grid gap-4 sm:grid-cols-[auto_1fr] sm:items-end">
        <Uploader kind="image" label="Profile photo" compact defaultPreview={trainer.image} />
        <div className="space-y-1.5">
          <Label htmlFor="name">Display name</Label>
          <Input id="name" defaultValue={trainer.name} className="h-11" required />
        </div>
      </div>
      <TrainerFields defaults={trainer} />
      <Button type="submit" size="lg" className="h-11 px-6 font-semibold">Save profile</Button>
    </form>
  );
}
