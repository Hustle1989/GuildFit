# GuildFit — v1 Implementation Plan

## Context
GuildFit is a personal-training platform built on camera for a 1–2 hour YouTube tutorial. The goal is to show each integration cleanly (Neon Postgres/Auth/Realtime, Paystack, Stream, ImageKit, Sentry, Cloudways) behind a premium dark UI, not to build a production platform. The directory is empty (greenfield). The spec below was agreed in the interview. The plan is ordered as recording chapters.

## Execution scope for this session (user request: "save as PLAN.md, build the Next.js project, keep it simple")
1. Copy this plan verbatim to `c:\Users\23470\OneDrive\Desktop\GuildFit\PLAN.md`.
2. Scaffold the project in the existing `GuildFit` folder: `npx create-next-app@16.4.5 . --ts --tailwind --app --src-dir --eslint --use-npm --import-alias "@/*"`, then `npx shadcn@latest init` + the handful of components we need (button, card, input, textarea, label, badge, dialog, select, tabs, skeleton, sonner).
3. Build chapters 1–11 with the **simplest code that works**:
   - No extra abstraction layers or generic repositories.
   - One `lib/*.ts` file per integration.
   - Plain server actions + zod.
   - shadcn + Stream prebuilt UI.
   - Light seed data.
4. Add `.env.example` listing every variable. `lib/env.ts` validates lazily, so `next build` succeeds without real keys.
5. Verify locally: `npm run lint`, `npx tsc --noEmit`, `npm run build`, and `npm run dev` smoke check of the public pages.
   - Live integration checks (Paystack, Stream, ImageKit, Neon Realtime/Auth, Sentry) need your keys. I'll report which ones were verified and which still need keys.
6. Chapter 12 (Cloudways deploy) and the Sentry wizard's interactive login step are done by you. I'll leave exact steps in the README.

## Agreed spec (summary)
- **Roles:** client and trainer. Role is chosen once at onboarding, and trainers go live immediately. No admin.
- **Money:** one monthly Paystack membership (₦5,000) unlocks all programs and is platform revenue. 1:1 sessions are a one-time Paystack payment, with the price set per slot and no membership needed. Trainers earn only from sessions, minus a 10% fee, recorded in a ledger with no payouts. No refunds or cancellations.
- **Content:** Program → flat ordered Lessons. The first lesson is a free preview. Videos are private ImageKit files served through signed URLs.
- **Chat:** any signed-in user can DM any trainer (Stream: threads, replies, reactions).
- **Sessions:** trainer-created slots. Booking holds a slot for 15 min, then Paystack payment, then the webhook confirms it. Stream call id = bookingId. Join is enabled from 10 min before start to slot end.
- **Realtime:** Neon Realtime only on the trainer dashboard (live paid bookings and earnings).
- **Discovery:** search + specialty filters in the URL. No reviews.
- **Auth:** Neon Auth with email/password + Google.
- **Ops:** local + production (Cloudways Velocity, auto-deploy from GitHub `main`). Sentry covers errors, tracing, Replay and a Seer demo. Seed script for demo data. Done = manual E2E checklist.

## Verified versions / SDK facts (Nov 2026)
- `next@16.4.5` (React 19). `proxy.ts` replaces `middleware.ts`.
- Neon Auth = managed Better Auth (`@neondatabase/auth`, Next.js SDK beta). Handler at `app/api/auth/[...path]/route.ts`. Needs `NEON_AUTH_BASE_URL` + a cookie secret of 32+ characters.
- Neon Realtime (beta), following the official `neondatabase/examples/realtime/with-nextjs` pattern:
  - Packages: `@neon/realtime`, `@neon/realtime-drizzle`, `@neon/realtime-react`.
  - Server `createRealtime({ secret, db, adapter: drizzleAdapter() })`, created lazily and marked `server-only`.
  - Seal the query in a Server Component (`realtime.seal({ query })`).
  - Renew through a **Route Handler**, not a server action.
  - Client side: `createRealtimeClient({ url, parsers: drizzleParsers })` + `RealtimeProvider` + `useLiveQuery(sealed, { initialData, refreshQuery })`.
  - Live queries must be deterministic SELECTs (no `now()`), and live rows don't keep `ORDER BY`, so sort on the client.
  - DB access is Drizzle over a `pg` Pool.
- ImageKit:
  - `@imagekit/next`: `upload()` on the client, `getUploadAuthParams` from `@imagekit/next/server`.
  - Video player is `IKVideoPlayer` from `@imagekit/video-player/react` (beta), with a `signerFn` prop for private files.
- Stream:
  - Client: `stream-chat` + `stream-chat-react` for chat, `@stream-io/video-react-sdk` for calls.
  - Server: `@stream-io/node-sdk` for tokens, user upserts and `call.getOrCreate({ data: { members } })`. Confirm the exact method names during the build.
- Paystack:
  - Initialize a transaction with `plan` to start a subscription.
  - Webhook auth is HMAC-SHA512 of the raw body compared to `x-paystack-signature`.
  - Cancel with `POST /subscription/disable { code, token }`.

## Project layout (key files)
```
src/
  proxy.ts                         # redirect signed-out users from protected routes (not the security boundary)
  lib/env.ts                       # zod-validated env (server vs NEXT_PUBLIC_)
  lib/db.ts, db/schema.ts          # Drizzle + pg Pool, all tables
  lib/auth.ts                      # getUser(), requireUser(), requireRole('trainer'|'client')
  lib/access.ts                    # hasActiveMembership(userId), canWatchLesson(user, lesson)
  lib/money.ts                     # kobo helpers, formatNaira, PLATFORM_FEE_BPS=1000
  lib/paystack.ts                  # initialize, verify, disableSubscription, verifySignature
  lib/fulfill.ts                   # idempotent fulfillPayment(reference) shared by webhook + callback
  lib/stream.ts                    # server-only: token, upsertUser, getOrCreateSessionCall
  lib/imagekit.ts                  # server-only: upload auth, signed video URL
  lib/realtime.ts                  # server-only lazy createRealtime
  lib/live/trainer-bookings.ts     # query builder + seal + load
  app/(public)/...                 # landing, trainers, programs, pricing
  app/(app)/...                    # onboarding, dashboard, messages, sessions, billing
  app/trainer/...                  # trainer dashboard pages
  app/api/auth/[...path]/route.ts
  app/api/webhooks/paystack/route.ts
  app/api/upload-auth/route.ts
  app/api/lessons/[id]/sign/route.ts
  app/api/stream/token/route.ts
  app/api/trainer/live-bookings/route.ts   # Realtime renewal
  components/ui/* (shadcn), components/uploader.tsx, components/chat/*, components/call/*
scripts/seed.ts
drizzle.config.ts, neon.ts (if using Neon config-as-code), instrumentation*.ts (Sentry)
```

## Data model (`db/schema.ts`; money in integer kobo, timestamptz)
- `profiles`: id text PK (= Neon Auth user id, no FK into the managed schema), email, name, avatar_url, role enum(client|trainer) nullable, created_at
- `trainer_profiles`: user_id PK→profiles, slug unique, headline, bio, specialties text[], cover_url, created_at
- `programs`: id uuid, trainer_id→profiles, slug unique, title, description, level enum, cover_url, published bool default false, created_at
- `lessons`: id, program_id→programs ON DELETE CASCADE, position int (unique program_id+position), title, notes, video_file_id, video_path, duration_sec. Preview = min(position).
- `enrollments`: (user_id, program_id) PK, created_at
- `lesson_progress`: (user_id, lesson_id) PK, completed_at
- `memberships`: user_id PK, paystack_customer_code, subscription_code unique, email_token, status enum(active|non_renewing|attention|cancelled), current_period_end
- `slots`: id, trainer_id, starts_at, duration_min (30|45|60), price_kobo, created_at
- `bookings`: id, slot_id **unique**, client_id, trainer_id, amount_kobo, status enum(pending|paid), reference unique, created_at, paid_at
- `earnings`: id, trainer_id, booking_id **unique**, gross_kobo, fee_kobo, net_kobo, created_at
- `webhook_events`: key unique, received_at

## Chapters (build order)

**0. Off-camera prep**
- Neon project in aws-eu-central-1 with Auth + Realtime enabled. Dev branch for local.
- Google OAuth client.
- Paystack test keys + a "GuildFit Monthly" ₦5,000 plan.
- Stream app (key/secret).
- ImageKit account with sample covers and short videos uploaded as private files.
- Sentry project + Seer/GitHub integration.
- Cloudways Velocity access.
- ngrok or cloudflared.
- **Spike Neon Realtime + Neon Auth end-to-end before recording.**

**1. Scaffold & design system**
- `create-next-app@16.4.5` (TS, Tailwind v4, App Router, `src/`), `shadcn init`.
- Dark tokens in `globals.css` (charcoal + one lime/orange accent), display font.
- App shell: navbar with role-aware links, footer, `loading.tsx` skeletons, a reusable `EmptyState`.
- `lib/env.ts`.

**2. Database**
- Drizzle schema above, `lib/db.ts` (pg Pool), `drizzle-kit generate && migrate`.
- `scripts/seed.ts`: 4 trainers, 6 programs, 3–5 lessons each pointing at pre-uploaded ImageKit paths, future slots.

**3. Auth & onboarding**
- Neon Auth quickstart: handler route, auth UI pages restyled dark, `proxy.ts` for `/dashboard`, `/trainer/*`, `/messages`, `/sessions/*`, `/billing`, `/onboarding`.
- `lib/auth.ts` helpers. A user without a profile role is redirected to `/onboarding`.
- Onboarding server action: zod-validate, insert `profiles` (+ `trainer_profiles` with a slug), `upsertUser` to Stream.

**4. Public discovery + SEO**
- Landing: hero, featured trainers/programs, pricing CTA.
- `/trainers?q=&specialty=` and `/programs?q=&level=` using server-side filtering with `searchParams`.
- `/trainers/[slug]`: bio, programs, open slots, Message/Book buttons.
- `/programs/[slug]`: lesson list with lock icons; the preview lesson plays.
- `generateMetadata` + OG from the cover image, `sitemap.ts`, `robots.ts`.

**5. ImageKit: programs, lessons, playback**
- `/api/upload-auth` (trainers only) → `getUploadAuthParams`.
- `components/uploader.tsx`: client `upload()` with progress, type/size checks (images ≤5 MB, mp4 ≤200 MB), `isPrivateFile` for videos.
- Trainer CRUD: `/trainer/programs`, `/new`, `/[id]` (edit, publish toggle, add/delete lessons, move up/down).
- Lesson page `/programs/[slug]/lessons/[lessonId]`:
  - Server checks `canWatchLesson`.
  - `IKVideoPlayer` `signerFn` → `/api/lessons/[id]/sign`, which re-checks access and returns a ~1 h signed URL.
  - Locked lessons show a paywall card.
  - First open creates an enrollment; "Mark complete" writes progress.
  - Fallback if the player beta misbehaves: a native `<video>` with the signed URL.

**6. Paystack membership**
- `/pricing` subscribe action → `initialize({ email, plan, metadata: { type: 'membership', userId }, callback_url: /payments/callback })` → redirect.
- `/payments/callback`: `verify(reference)` → `fulfillPayment` → success/fail UI.
- `/api/webhooks/paystack`:
  - Read the raw body, verify the signature, and dedupe with `webhook_events`.
  - `charge.success` → `fulfillPayment`: membership active, or booking paid.
  - `subscription.create`: store `subscription_code`, `email_token`, `current_period_end = next_payment_date`. Map to the user by `profiles.email`.
  - `invoice.update` (paid) extends the period. `invoice.payment_failed` → attention. `subscription.not_renew` → non_renewing. `subscription.disable` → cancelled.
  - Always return 200 after a valid signature.
- The callback sets a provisional `current_period_end = now + 1 month` so access is instant.
- `/billing`: status + Cancel (disable subscription; access continues to period end).

**7. Slots, booking, earnings**
- `/trainer/availability`: create slots (date/time in the viewer's TZ → UTC, duration, price) and delete unbooked ones.
- `bookSlot` action runs one transaction:
  - Lock the slot's booking row.
  - Reject if it is paid, or held by someone else for less than 15 min.
  - Otherwise delete the stale pending booking and insert a pending one with `reference = gf_<bookingId>`.
- Then Paystack initialize with the amount from the **DB**, `metadata: { type: 'session', bookingId }`.
- `fulfillPayment` for a session runs in one transaction: verify the amount, mark the booking paid, insert `earnings` (fee = 10%) with `ON CONFLICT (booking_id) DO NOTHING`.
- If a webhook arrives for a replaced or expired booking, log it to Sentry (manual refund, v2).
- Client `/dashboard`: upcoming sessions, my programs + progress, membership status.
- `/trainer/earnings`: ledger table + totals. `/trainer/clients`: distinct paid-booking clients ∪ enrolled users.

**8. Stream chat**
- `/api/stream/token`: authed; returns a short-lived token.
- Client `ChatProvider` with `tokenProvider`, connected only on `/messages` and the trainer inbox.
- "Message" button action: `channel('messaging', { members: [me, trainer] })` (distinct by members) → `/messages?c=<cid>`.
- `/messages`: ChannelList + Channel + MessageList + MessageInput + Thread (replies/reactions built in). Dark theme via Stream CSS variables.

**9. Stream video sessions**
- `/sessions/[bookingId]`: the server checks that the user is the booking's client or trainer and that status is paid. Countdown until the join window.
- When joining: server `getOrCreateSessionCall(bookingId, [clientId, trainerId])`, then client `StreamVideo` → `StreamCall` → `SpeakerLayout` + `CallControls`, with `call.leave()` on unmount.

**10. Neon Realtime trainer dashboard**
- `lib/live/trainer-bookings.ts`: `select … from bookings join slots join profiles where trainer_id = $me and status = 'paid'` (deterministic) + `seal` + `load` (Promise.all).
- `/trainer` Server Component (`await connection()`) passes `initialData` + `sealedQuery` to `RealtimeRoot` → `LiveBookingsFeed`.
- `useLiveQuery` with `refreshQuery` → `POST /api/trainer/live-bookings`, which re-checks the session and returns `no-store`.
- The client sorts rows and computes totals (gross/net, this month).
- Fallback: `router.refresh()` polling every 15 s if Realtime fails.

**11. Sentry**
- `npx @sentry/wizard@latest -i nextjs`: instrumentation files, `global-error.tsx`, `withSentryConfig`, tracing, Replay.
- `Sentry.setTag/setContext` in the webhook + `bookSlot` + `fulfillPayment`; `captureException` on handled failures.
- A deliberate bug (for example a broken earnings formatter behind a "Download report" button) → issue in Sentry → run Seer root-cause analysis and suggested fix.

**12. Deploy to Cloudways Velocity**
- Push to GitHub, create the Velocity app from the repo (Next.js SSR preset), set all env vars (including `SENTRY_AUTH_TOKEN` for source maps), run migrations + seed against the Neon main branch.
- Update external settings:
  - Paystack webhook URL → `https://<domain>/api/webhooks/paystack`.
  - Neon Auth trusted domain + Google redirect URI.
  - Realtime `allowedOrigins` += prod domain.
- Run the verification script on prod.

## Environment variables
`DATABASE_URL`, `NEON_AUTH_BASE_URL`, `NEON_AUTH_COOKIE_SECRET`, `NEON_REALTIME_SECRET`, `NEXT_PUBLIC_NEON_REALTIME_URL` (only the URL is public), `PAYSTACK_SECRET_KEY`, `PAYSTACK_PLAN_CODE`, `NEXT_PUBLIC_STREAM_API_KEY`, `STREAM_API_SECRET`, `NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT`, `NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `NEXT_PUBLIC_APP_URL`. All secrets are read only in `server-only` modules.

## Cross-cutting rules
- Every server action/route: `requireUser`/`requireRole` + ownership check + zod parse. Never trust client ids or amounts.
- Server actions return `{ ok, error }`. Forms show inline errors. Submit buttons disable while pending (prevents duplicate submits).
- `revalidatePath` after trainer mutations. Authed pages render dynamically.
- Each list has an empty state and each route segment has `loading.tsx` + `error.tsx` (the error boundary reports to Sentry).

## Verification (definition of done)
1. `npm run lint && npx tsc --noEmit && npm run build` pass.
2. Local E2E with the tunnel, then repeat on production:
   1. Visitor browses `/trainers` (search + filter), opens a program, and plays the preview lesson. Lesson 2 shows the paywall.
   2. Sign up with email as a **trainer**, complete onboarding, create a program, upload a cover + one lesson video (progress bar), publish, and add a slot 5 min ahead.
   3. In a second browser, sign up with Google as a **client**, subscribe with the Paystack test card, land on the callback, and lesson 2 now plays (check that the signed URL expires and that copying the raw path fails).
   4. Client messages the trainer: reply in a thread and add a reaction. The trainer sees it in `/messages`.
   5. Client books the slot. A third user trying the same slot is blocked. Pay. The **trainer dashboard updates live** with no refresh, and the earnings show 90% net.
   6. Replaying the same webhook (Paystack dashboard "resend") creates no duplicate earnings.
   7. Both users join the call inside the window. Before the window, the button is disabled.
   8. Client cancels the membership: status shows non-renewing and access remains.
   9. Trigger the deliberate bug: the Sentry issue has a Replay, and Seer produces a root cause.

## Assumptions
- ₦5,000/month plan.
- 10% fee.
- Slots of 30/45/60 min, stored in UTC and shown in local time.
- Private videos with ~1 h signed URLs.
- Upload limits 5 MB images / 200 MB mp4.
- Enrollment is created on first lesson open.
- Lapsed membership relocks lessons but keeps progress.
- Programs are unpublished, not deleted.
- Users map to Paystack by email.
- Neon Auth prebuilt UI restyled.
- No rate limiting.
- No transactional email.
- No account deletion.
- npm.

## Open risks
1. Six integrations is a tight fit for 1–2 h. Keep UI polish pre-planned and lean on shadcn + Stream prebuilt UI.
2. Neon Realtime and the Neon Auth Next.js SDK are both beta. Spike them first. The polling fallback is planned.
3. Cloudways Velocity is in Public Preview. Confirm access, Node version, and build-time env handling.
4. Seer needs a paid plan or trial.
5. Paystack test mode can't easily trigger renewal or failed-payment events.
6. The ImageKit video player is beta. Free-plan video limits and the signed-URL helper name in the Node SDK need confirming.
7. Stream free-tier limits for chat + video. Confirm `@stream-io/node-sdk` method names.
8. The join window means the demo slot must be created a few minutes ahead.

## Build notes (first implementation pass)
Differences from the plan above, decided during the build:
- **Cache Components off.** The `create-next-app@16.4.5` template enables `cacheComponents` and `partialPrefetching`. Both are disabled because almost every page reads the session or DB per request; the root layout is `force-dynamic`.
- **ImageKit video player not used.** `@imagekit/video-player@1.0.0-beta.7` doesn't support React 19. Lessons use a native `<video>` with a 1-hour signed URL generated in the Server Component, so `/api/lessons/[id]/sign` wasn't needed.
- **Sentry setup is manual, not the wizard.** v11 exports `withSentryConfig` from `@sentry/nextjs/config`. The Seer demo is an explicit "Send test error to Sentry" button on `/trainer`, not a planted bug.
- **Membership access uses `current_period_end > now()` only.** Status is informational, so cancelled members keep access until the paid month ends.
- **Auth UI is custom forms** using `authClient` from `@neondatabase/auth/next`, not the Neon Auth UI kit.
- **Stream Chat v14** renamed `MessageInput` to `MessageComposer`.
