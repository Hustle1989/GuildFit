"use client";

import { GOAL_ICONS } from "@/components/shared";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Uploader } from "@/components/uploader";
import { GOALS, type Trainer } from "@/lib/mock-data";

/** Coach profile fields, shared by onboarding and /trainer/profile. */
export function TrainerFields({ defaults }: { defaults?: Partial<Trainer> }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="title">Specialty title</Label>
          <Input id="title" defaultValue={defaults?.title} placeholder="Strength & Muscle" className="h-11" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="location">City</Label>
          <Input id="location" defaultValue={defaults?.location} placeholder="Lagos" className="h-11" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="headline">Headline</Label>
        <Input id="headline" defaultValue={defaults?.headline} placeholder="Strength coach for busy professionals" className="h-11" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" defaultValue={defaults?.bio} rows={5} placeholder="Your experience, certifications and coaching style…" required />
      </div>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Goals you coach</legend>
        <div className="flex flex-wrap gap-2">
          {GOALS.map((g) => {
            const Icon = GOAL_ICONS[g.key];
            return (
              <label key={g.key} className="cursor-pointer">
                <input type="checkbox" defaultChecked={defaults?.goals?.includes(g.key)} className="peer sr-only" />
                <span className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-sm text-muted-foreground transition peer-checked:border-primary peer-checked:bg-primary/15 peer-checked:text-primary">
                  <Icon className="size-4" /> {g.label}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>
      <div className="space-y-1.5">
        <Label htmlFor="price">Default 1:1 session price (₦)</Label>
        <Input id="price" type="number" min={1000} step={500} defaultValue={defaults?.sessionPriceKobo ? defaults.sessionPriceKobo / 100 : 10000} className="h-11" />
      </div>
      <Uploader kind="image" label="Cover photo" aspect="aspect-[16/9]" defaultPreview={defaults?.image} />
    </div>
  );
}
