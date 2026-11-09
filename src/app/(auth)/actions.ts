"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, profiles } from "@/db";
import { getAuth } from "@/lib/auth/server";
import { DEMO_ACCOUNTS, DEMO_PASSWORD, demoLoginEnabled } from "@/lib/demo";
import { homeFor } from "@/lib/session";

export type AuthFormState = { error?: string; email?: string; name?: string };

const signInSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

const signUpSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name."),
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters for your password."),
});

function messageFor(error: { code?: string; status?: number; message?: string }) {
  switch (error.code) {
    case "INVALID_EMAIL_OR_PASSWORD":
      return "That email and password don't match. Try again.";
    case "USER_ALREADY_EXISTS":
    case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
      return "An account with this email already exists. Sign in instead.";
    case "PASSWORD_TOO_SHORT":
      return "Use at least 8 characters for your password.";
  }
  if (error.status === 429) return "Too many attempts. Wait a moment and try again.";
  if (error.status === 401) return "That email and password don't match. Try again.";
  return error.message || "Something went wrong. Please try again.";
}

/** After signing in, send the user to their area (or onboarding). */
async function redirectHome(userId: string): Promise<never> {
  const [profile] = await db.select({ role: profiles.role }).from(profiles).where(eq(profiles.id, userId));
  redirect(homeFor(profile?.role ?? null));
}

export async function signInAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const parsed = signInSchema.safeParse({ email, password: formData.get("password") });
  if (!parsed.success) return { error: parsed.error.issues[0].message, email };

  const { data, error } = await getAuth().signIn.email(parsed.data);
  if (error || !data?.user) return { error: messageFor(error ?? {}), email };
  return redirectHome(data.user.id);
}

export async function signUpAction(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const parsed = signUpSchema.safeParse({ name, email, password: formData.get("password") });
  if (!parsed.success) return { error: parsed.error.issues[0].message, email, name };

  const { data, error } = await getAuth().signUp.email(parsed.data);
  if (error || !data?.user) return { error: messageFor(error ?? {}), email, name };
  redirect("/onboarding");
}

/** "Demo shortcuts": sign in as a seeded account. */
export async function demoSignInAction(formData: FormData) {
  if (!demoLoginEnabled()) redirect("/sign-in");
  const role = formData.get("role") === "trainer" ? "trainer" : "client";
  const { data, error } = await getAuth().signIn.email({ email: DEMO_ACCOUNTS[role], password: DEMO_PASSWORD });
  if (error || !data?.user) redirect("/sign-in?demo=missing");
  return redirectHome(data.user.id);
}
