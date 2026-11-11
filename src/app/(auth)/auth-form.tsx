"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { ArrowRight, CircleAlert, Dumbbell, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/client";
import { demoSignInAction, signInAction, signUpAction, type AuthFormState } from "./actions";

export function AuthForm({ mode, demoLogin, notice }: { mode: "sign-in" | "sign-up"; demoLogin: boolean; notice?: string }) {
  const isSignUp = mode === "sign-up";
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(isSignUp ? signUpAction : signInAction, {});
  const [google, setGoogle] = useState<"idle" | "pending" | string>("idle");
  const error = state.error ?? (google !== "idle" && google !== "pending" ? google : notice);

  async function continueWithGoogle() {
    setGoogle("pending");
    // Neon Auth sends the user to Google, then back here; proxy.ts finishes the hand-off.
    const { error } = await authClient.signIn.social({ provider: "google", callbackURL: `${window.location.origin}/onboarding` });
    if (error) setGoogle(error.message ?? "Google sign-in failed. Try again.");
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="font-display text-4xl">{isSignUp ? "Create your account" : "Welcome back"}</h1>
      <p className="mt-2 text-muted-foreground">{isSignUp ? "Clients and coaches start here." : "Sign in to keep training."}</p>

      <Button variant="outline" className="mt-8 h-11 w-full text-sm" onClick={continueWithGoogle} disabled={google === "pending"}>
        {google === "pending" ? <Loader2 className="animate-spin" /> : <GoogleMark />} Continue with Google
      </Button>

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-foreground/10" /> or with email <span className="h-px flex-1 bg-foreground/10" />
      </div>

      <form action={formAction} className="space-y-4" noValidate>
        {error && (
          <p role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
            <CircleAlert className="mt-0.5 size-4 shrink-0" /> {error}
          </p>
        )}
        {isSignUp && (
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" autoComplete="name" required defaultValue={state.name} className="h-11" placeholder="Ada Okonkwo" />
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required defaultValue={state.email} className="h-11" placeholder="you@example.com" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete={isSignUp ? "new-password" : "current-password"}
            required
            minLength={isSignUp ? 8 : undefined}
            className="h-11"
            placeholder={isSignUp ? "At least 8 characters" : "Your password"}
          />
        </div>
        <Button type="submit" className="h-11 w-full text-sm font-semibold" disabled={pending}>
          {pending && <Loader2 className="animate-spin" />}
          {isSignUp ? "Create account" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {isSignUp ? "Already have an account? " : "New to GuildFit? "}
        <Link href={isSignUp ? "/sign-in" : "/sign-up"} className="font-semibold text-primary hover:underline">
          {isSignUp ? "Sign in" : "Create one"}
        </Link>
      </p>

      {!isSignUp && demoLogin && (
        <div className="mt-8 rounded-xl border border-dashed border-foreground/15 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Demo shortcuts</p>
          <p className="mt-1 text-xs text-muted-foreground">Sign in as a seeded account.</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <DemoButton role="client" icon={<User />} label="Client" />
            <DemoButton role="trainer" icon={<Dumbbell />} label="Trainer" />
          </div>
        </div>
      )}
    </div>
  );
}

function DemoButton({ role, icon, label }: { role: "client" | "trainer"; icon: React.ReactNode; label: string }) {
  return (
    <form action={demoSignInAction}>
      <input type="hidden" name="role" value={role} />
      <DemoSubmit icon={icon} label={label} />
    </form>
  );
}

function DemoSubmit({ icon, label }: { icon: React.ReactNode; label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="secondary" className="h-10 w-full justify-between" disabled={pending}>
      <span className="flex items-center gap-2">
        {pending ? <Loader2 className="animate-spin" /> : icon} {label}
      </span>
      <ArrowRight />
    </Button>
  );
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path fill="#4285F4" d="M22.6 12.2c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.6c2.1-1.9 3.3-4.8 3.3-8z" />
      <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.8c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.9A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7H2.1a11 11 0 0 0 0 10l3.7-2.9z" />
      <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7l3.7 2.9C6.7 7.3 9.1 5.4 12 5.4z" />
    </svg>
  );
}
