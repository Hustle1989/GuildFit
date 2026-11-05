"use client";

import { useState } from "react";
import { Dumbbell, User } from "lucide-react";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/submit-button";
import { TrainerProfileFields } from "@/components/trainer-profile-fields";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Uploader } from "@/components/uploader";
import { cn } from "@/lib/utils";
import { completeOnboarding } from "./actions";

const ROLES = [
  { value: "client", icon: User, title: "I want to train", text: "Follow programs, chat with coaches, book sessions." },
  { value: "trainer", icon: Dumbbell, title: "I'm a trainer", text: "Publish programs, take bookings, coach clients." },
] as const;

export function OnboardingForm({ defaultName }: { defaultName: string }) {
  const [role, setRole] = useState<"client" | "trainer">("client");

  return (
    <ActionForm action={completeOnboarding} className="space-y-8">
      <div className="grid gap-3 sm:grid-cols-2">
        {ROLES.map(({ value, icon: Icon, title, text }) => (
          <label
            key={value}
            className={cn(
              "cursor-pointer rounded-2xl border p-5 transition",
              role === value ? "border-primary bg-primary/10" : "hover:border-foreground/20",
            )}
          >
            <input type="radio" name="role" value={value} checked={role === value} onChange={() => setRole(value)} className="sr-only" />
            <Icon className="mb-3 size-6 text-primary" />
            <p className="font-semibold">{title}</p>
            <p className="text-sm text-muted-foreground">{text}</p>
          </label>
        ))}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="name">Display name</Label>
        <Input id="name" name="name" defaultValue={defaultName} required minLength={2} />
      </div>
      <Uploader name="avatarUrl" kind="image" folder="/guildfit/avatars" label="Profile photo (optional)" />

      {role === "trainer" && <TrainerProfileFields />}

      <SubmitButton size="lg" className="h-11 w-full">
        {role === "trainer" ? "Create my trainer profile" : "Start training"}
      </SubmitButton>
    </ActionForm>
  );
}
