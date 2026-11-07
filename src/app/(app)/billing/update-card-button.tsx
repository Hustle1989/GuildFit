"use client";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function UpdateCardButton() {
  return (
    <Button variant="outline" className="mt-auto w-full" onClick={() => toast.info("You'll update your card on Paystack's secure page (demo).")}>
      Update card
    </Button>
  );
}
