"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Dumbbell, Loader2, User } from "lucide-react";
import { TrainerFields } from "@/components/trainer-fields";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Uploader } from "@/components/uploader";
import { cn } from "@/lib/utils";

const ROLES = [
  { value: "client", icon: User, title: "I want to train", text: "Follow programs, chat with coaches and book 1:1 sessions." },
  { value: "trainer", icon: Dumbbell, title: "I'm a coach", text: "Publish programs, take paid bookings and coach clients." },
] as const;

export function OnboardingForm() {
  const router = useRouter();
  const [role, setRole] = useState<"client" | "trainer">("client");
  const [pending, setPending] = useState(false);

  return (
    <form
      className="mt-10 space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        setPending(true);
        setTimeout(() => router.push(role === "trainer" ? "/trainer" : "/dashboard"), 600);
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {ROLES.map(({ value, icon: Icon, title, text }) => (
          <label
            key={value}
            className={cn(
              "relative cursor-pointer rounded-2xl border p-6 transition",
              role === value ? "glow border-primary bg-primary/10" : "border-border bg-card hover:border-foreground/25",
            )}
          >
            <input type="radio" name="role" value={value} checked={role === value} onChange={() => setRole(value)} className="sr-only" />
            {role === value && (
              <span className="absolute right-4 top-4 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground">
                <Check className="size-3.5" />
              </span>
            )}
            <span className="grid size-12 place-items-center rounded-full border border-primary/30 text-primary">
              <Icon className="size-5" />
            </span>
            <p className="mt-4 text-lg font-bold">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{text}</p>
          </label>
        ))}
      </div>

      <div className="space-y-6 rounded-2xl border border-border bg-card p-6">
        <div className="space-y-1.5">
          <Label htmlFor="name">Display name</Label>
          <Input id="name" defaultValue="Ada Okonkwo" required className="h-11" />
        </div>
        <Uploader kind="image" label="Profile photo (optional)" compact />
        {role === "trainer" && <TrainerFields />}
      </div>

      <Button type="submit" size="lg" className="glow h-12 w-full text-base font-semibold" disabled={pending}>
        {pending && <Loader2 className="animate-spin" />}
        {role === "trainer" ? "Create my coach profile" : "Start training"}
      </Button>
    </form>
  );
}
