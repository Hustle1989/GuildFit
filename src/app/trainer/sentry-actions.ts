"use server";

import * as Sentry from "@sentry/nextjs";
import { requireTrainer } from "@/lib/session";

export async function sendSentryTestError() {
  const user = await requireTrainer();
  Sentry.setUser({ id: user.id });
  const error = new Error("GuildFit Sentry test error from the trainer studio");
  Sentry.captureException(error, { tags: { flow: "sentry-test" } });
  await Sentry.flush(2000);
  throw error;
}
