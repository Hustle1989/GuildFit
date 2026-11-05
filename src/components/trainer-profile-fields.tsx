"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Uploader } from "@/components/uploader";
import { SPECIALTIES } from "@/lib/utils";

export type TrainerProfileDefaults = {
  headline?: string;
  bio?: string;
  specialties?: string[];
  coverUrl?: string | null;
};

/** Trainer-only profile fields, shared by onboarding and /trainer/profile. */
export function TrainerProfileFields({ defaults = {} }: { defaults?: TrainerProfileDefaults }) {
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="headline">Headline</Label>
        <Input id="headline" name="headline" defaultValue={defaults.headline} placeholder="Strength coach helping busy people get strong" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" name="bio" defaultValue={defaults.bio} rows={5} placeholder="Your experience, certifications and coaching style…" required />
      </div>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Specialties</legend>
        <div className="flex flex-wrap gap-2">
          {SPECIALTIES.map((s) => (
            <label key={s} className="cursor-pointer">
              <input type="checkbox" name="specialties" value={s} defaultChecked={defaults.specialties?.includes(s)} className="peer sr-only" />
              <span className="inline-block rounded-full border px-3 py-1 text-sm text-muted-foreground transition peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground">
                {s}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <Uploader name="coverUrl" kind="image" folder="/guildfit/covers" label="Cover photo" defaultValue={defaults.coverUrl} />
    </div>
  );
}
