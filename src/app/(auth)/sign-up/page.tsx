import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, homeFor } from "@/lib/session";
import { AuthForm } from "../auth-form";

export const metadata: Metadata = { title: "Create account" };

export default async function SignUpPage() {
  const user = await getCurrentUser();
  if (user) redirect(homeFor(user.role));
  return <AuthForm mode="sign-up" demoLogin={false} />;
}
