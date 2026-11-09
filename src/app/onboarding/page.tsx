import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/site/logo";
import { homeFor, requireUser } from "@/lib/session";
import { OnboardingForm } from "./onboarding-form";

export const metadata: Metadata = { title: "Welcome" };

export default async function OnboardingPage() {
  const user = await requireUser();
  if (user.role) redirect(homeFor(user.role)); // the role is chosen once

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute -top-40 left-1/2 size-[600px] -translate-x-1/2 rounded-full bg-primary/10 blur-[150px]" />
      <div className="relative mx-auto max-w-2xl px-4 py-8">
        <Logo />
        <div className="mt-12">
          <p className="eyebrow">Step 1 of 1</p>
          <h1 className="font-display mt-3 text-4xl sm:text-5xl">Welcome to GuildFit</h1>
          <p className="mt-3 text-muted-foreground">
            Signed in as {user.email}. Tell us how you&apos;ll use GuildFit. You can&apos;t change this later.
          </p>
        </div>
        <OnboardingForm defaultName={user.name} />
      </div>
    </div>
  );
}
