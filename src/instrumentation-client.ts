import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  enabled: Boolean(process.env.NEXT_PUBLIC_SENTRY_DSN),
  integrations: [Sentry.replayIntegration()],
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.2 : 1.0,
  // Session Replay: record 10% of sessions, and every session with an error.
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
