import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="font-display text-7xl text-primary">404</p>
      <h1 className="mt-4 text-2xl font-bold">This page skipped leg day</h1>
      <p className="mt-2 text-muted-foreground">We couldn&apos;t find what you were looking for.</p>
      <Link href="/" className={buttonVariants({ className: "mt-6" })}>Back home</Link>
    </div>
  );
}
