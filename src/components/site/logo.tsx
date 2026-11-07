import Link from "next/link";
import { Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";

/** App mark: a dumbbell in a mint rounded square. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span className={cn("grid size-8 shrink-0 place-items-center rounded-[10px] bg-primary text-primary-foreground", className)}>
      <Dumbbell className="size-[18px]" strokeWidth={2.25} aria-hidden />
    </span>
  );
}

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("flex items-center gap-2.5 text-lg font-semibold tracking-tight", className)} aria-label="GuildFit home">
      <LogoMark />
      GuildFit
    </Link>
  );
}
