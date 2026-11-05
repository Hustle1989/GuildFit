"use client";

import { Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { sendSentryTestError } from "./sentry-actions";

/** For the Sentry/Seer part of the tutorial: sends a real server error. */
export function SentryTestButton() {
  return (
    <div className="rounded-2xl border border-dashed p-5 text-sm text-muted-foreground">
      <p className="mb-3">Monitoring check: throws a server error so you can see it (and a Replay) in Sentry.</p>
      <Button variant="outline" size="sm" onClick={() => sendSentryTestError().catch(() => {})}>
        <Bug /> Send test error to Sentry
      </Button>
    </div>
  );
}
