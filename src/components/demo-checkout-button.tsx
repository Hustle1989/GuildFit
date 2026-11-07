"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/** Stands in for "redirect to Paystack checkout" during the UI-only phase. */
export function DemoCheckoutButton({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  return (
    <Button
      size="lg"
      className={className}
      disabled={pending}
      onClick={() => {
        setPending(true);
        toast.loading("Redirecting to Paystack… (demo)", { duration: 1200 });
        setTimeout(() => router.push(href), 900);
      }}
    >
      {pending && <Loader2 className="animate-spin" />}
      {children}
    </Button>
  );
}
