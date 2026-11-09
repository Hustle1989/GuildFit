import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, profiles } from "@/db";
import { getAuth } from "@/lib/auth/server";

export type Role = "client" | "trainer";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  image: string | null;
  role: Role | null; // null until onboarding
};

/** The signed-in user plus their GuildFit profile. Cached per request. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const { data: session } = await getAuth().getSession();
  const user = session?.user;
  if (!user) return null;

  const [profile] = await db
    .select({ name: profiles.name, avatarUrl: profiles.avatarUrl, role: profiles.role })
    .from(profiles)
    .where(eq(profiles.id, user.id));

  return {
    id: user.id,
    email: user.email,
    name: profile?.name ?? user.name ?? user.email,
    image: profile?.avatarUrl ?? user.image ?? null,
    role: profile?.role ?? null,
  };
});

/** Where a signed-in user belongs after sign-in. */
export function homeFor(role: Role | null) {
  return role === "trainer" ? "/trainer" : role === "client" ? "/dashboard" : "/onboarding";
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");
  return user;
}

/** Signed in AND onboarded. */
export async function requireProfile() {
  const user = await requireUser();
  if (!user.role) redirect("/onboarding");
  return user as CurrentUser & { role: Role };
}

export async function requireTrainer() {
  const user = await requireProfile();
  if (user.role !== "trainer") redirect("/dashboard");
  return user;
}

export async function requireClient() {
  const user = await requireProfile();
  if (user.role !== "client") redirect("/trainer");
  return user;
}
