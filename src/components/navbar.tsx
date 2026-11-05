import Link from "next/link";
import { Dumbbell } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { SignOutButton } from "@/components/sign-out-button";
import { getCurrentUser } from "@/lib/session";

export async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Dumbbell className="size-4" />
          </span>
          GuildFit
        </Link>

        <div className="hidden items-center gap-5 text-sm text-muted-foreground sm:flex">
          <Link href="/trainers" className="hover:text-foreground">Trainers</Link>
          <Link href="/programs" className="hover:text-foreground">Programs</Link>
          <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              <Link href="/messages" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                Messages
              </Link>
              <Link
                href={user.role === "trainer" ? "/trainer" : "/dashboard"}
                className={buttonVariants({ variant: "secondary", size: "sm" })}
              >
                {user.role === "trainer" ? "Studio" : "Dashboard"}
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/sign-in" className={buttonVariants({ variant: "ghost", size: "sm" })}>
                Sign in
              </Link>
              <Link href="/sign-up" className={buttonVariants({ size: "sm" })}>
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
