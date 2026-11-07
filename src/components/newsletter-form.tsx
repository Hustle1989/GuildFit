"use client";

import { toast } from "sonner";

export function NewsletterForm() {
  return (
    <form
      className="flex w-full max-w-md overflow-hidden rounded-lg border border-border bg-background/60"
      onSubmit={(e) => {
        e.preventDefault();
        (e.currentTarget as HTMLFormElement).reset();
        toast.success("You're on the list! (demo)");
      }}
    >
      <input
        type="email"
        required
        placeholder="Your email address"
        aria-label="Email address"
        className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
      />
      <button type="submit" className="bg-primary px-6 text-sm font-semibold text-primary-foreground transition hover:brightness-110">
        Subscribe
      </button>
    </form>
  );
}
