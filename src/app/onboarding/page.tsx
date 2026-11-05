import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { OnboardingForm } from "./onboarding-form";

export const metadata: Metadata = { title: "Welcome" };

export default async function OnboardingPage() {
  const user = await requireUser();
  if (user.role) redirect(user.role === "trainer" ? "/trainer" : "/dashboard");

  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <h1 className="font-display text-4xl sm:text-5xl">Welcome to GuildFit</h1>
      <p className="mb-10 mt-3 text-muted-foreground">Tell us how you&apos;ll use GuildFit. You can&apos;t change this later.</p>
      <OnboardingForm defaultName={user.name} />
    </div>
  );
}
