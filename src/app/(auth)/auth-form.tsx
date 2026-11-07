"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Dumbbell, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/** UI-only: submitting just navigates. Neon Auth gets wired in later. */
export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const isSignUp = mode === "sign-up";
  const go = (href: string) => {
    setPending(true);
    setTimeout(() => router.push(href), 500);
  };

  return (
    <div className="w-full max-w-sm">
      <h1 className="font-display text-4xl">{isSignUp ? "Create your account" : "Welcome back"}</h1>
      <p className="mt-2 text-muted-foreground">{isSignUp ? "Clients and coaches start here." : "Sign in to keep training."}</p>

      <Button variant="outline" className="mt-8 h-11 w-full text-sm" onClick={() => go(isSignUp ? "/onboarding" : "/dashboard")}>
        <GoogleMark /> Continue with Google
      </Button>

      <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
        <span className="h-px flex-1 bg-foreground/10" /> or with email <span className="h-px flex-1 bg-foreground/10" />
      </div>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          go(isSignUp ? "/onboarding" : "/dashboard");
        }}
      >
        {isSignUp && (
          <div className="space-y-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" name="name" required className="h-11" placeholder="Ada Okonkwo" />
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required className="h-11" placeholder="you@example.com" />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            {!isSignUp && <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>}
          </div>
          <Input id="password" name="password" type="password" required minLength={8} className="h-11" placeholder="At least 8 characters" />
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

      {!isSignUp && (
        <div className="mt-8 rounded-xl border border-dashed border-foreground/15 p-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Demo shortcuts</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button variant="secondary" className="h-10 justify-between" onClick={() => go("/dashboard")}>
              <span className="flex items-center gap-2"><User /> Client</span> <ArrowRight />
            </Button>
            <Button variant="secondary" className="h-10 justify-between" onClick={() => go("/trainer")}>
              <span className="flex items-center gap-2"><Dumbbell /> Trainer</span> <ArrowRight />
            </Button>
          </div>
        </div>
      )}
    </div>
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
