"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ background: "#111", color: "#eee", fontFamily: "sans-serif", textAlign: "center", padding: "6rem 1rem" }}>
        <h1>Something went wrong</h1>
        <p>We&apos;ve been notified. Please refresh the page.</p>
      </body>
    </html>
  );
}
