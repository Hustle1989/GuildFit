import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { demoLoginEnabled } from "@/lib/demo";
import { getCurrentUser, homeFor } from "@/lib/session";
import { AuthForm } from "../auth-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({ searchParams }: PageProps<"/sign-in">) {
  const user = await getCurrentUser();
  if (user) redirect(homeFor(user.role));
  const { demo } = await searchParams;
  const notice = demo === "missing" ? "Demo accounts aren't set up yet. Run `npm run db:seed` and try again." : undefined;
  return <AuthForm mode="sign-in" demoLogin={demoLoginEnabled()} notice={notice} />;
}
