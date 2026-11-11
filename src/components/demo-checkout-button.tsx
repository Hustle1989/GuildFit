"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Submits a server action that completes checkout. Paystack isn't wired yet,
 * so the action records the payment directly (test mode, nothing is charged).
 */
export function CheckoutButton({ action, children, className }: { action: () => Promise<void>; children: React.ReactNode; className?: string }) {
  return (
    <form action={action}>
      <Submit className={className}>{children}</Submit>
    </form>
  );
}

function Submit({ children, className }: { children: React.ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className={className} disabled={pending}>
      {pending && <Loader2 className="animate-spin" />}
      {pending ? "Processing payment…" : children}
    </Button>
  );
}
