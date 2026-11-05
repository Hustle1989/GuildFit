import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, profiles } from "@/db";
import { getAuth } from "@/lib/auth/server";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  image: string | null;
  role: "client" | "trainer" | null;
};

/** The signed-in user plus their GuildFit role (null until onboarding). */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const { data } = await getAuth().getSession();
  const user = data?.user;
  if (!user) return null;

  const [profile] = await db.select().from(profiles).where(eq(profiles.id, user.id));
  return {
    id: user.id,
    email: user.email,
    name: profile?.name ?? user.name,
    image: profile?.avatarUrl ?? user.image ?? null,
    role: profile?.role ?? null,
  };
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  return user;
}

/** Signed in AND onboarded. */
export async function requireProfile() {
  const user = await requireUser();
  if (!user.role) redirect("/onboarding");
  return user as CurrentUser & { role: "client" | "trainer" };
}

export async function requireTrainer() {
  const user = await requireProfile();
  if (user.role !== "trainer") redirect("/dashboard");
  return user;
}
