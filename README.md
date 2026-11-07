# GuildFit

A personal-training platform. Clients find trainers, buy one monthly membership that unlocks every workout program, watch video lessons, chat with trainers and book paid 1:1 video sessions. Trainers manage programs, availability, clients and earnings.

See [PLAN.md](PLAN.md) for the full spec.

> **Current phase: UI only.** Every page renders from hardcoded demo data in
> [src/lib/mock-data.ts](src/lib/mock-data.ts). Nothing talks to Neon, Paystack, Stream or ImageKit yet,
> so `npm run dev` works with **no environment variables**. Forms, checkout, uploads,
> chat and video calls are simulated in the browser. The previously integrated version
> is in git commit `22404bd`. The integration steps below apply when we wire services back in.
>
> Demo entry points: the top bar links every area (Trainers, Programs, My Library, Messages,
> Trainer Dashboard), and `/sign-in` has **Client** and **Trainer** shortcut buttons. The lesson
> page has a **Preview as Visitor / Member** toggle to show the paywall.
>
> **Light and dark mode:** dark is the default. The sun/moon button (top bar, or the bottom of
> the trainer sidebar) switches themes and remembers the choice. Add `?theme=light` or
> `?theme=dark` to any URL to force one (handy for screenshots). Theme tokens live in
> [src/app/globals.css](src/app/globals.css); the toggle is [src/components/theme.tsx](src/components/theme.tsx).

| Concern | Service |
|---|---|
| App | Next.js 16 (App Router, server actions), Tailwind v4, shadcn/ui |
| Database | Neon Postgres + Drizzle ORM |
| Auth | Neon Auth (email/password + Google) |
| Realtime | Neon Realtime: live bookings feed on the trainer dashboard |
| Payments | Paystack: monthly membership plan + one-time session payments |
| Chat & video | Stream: chat (threads, replies, reactions) + 1:1 video calls |
| Media | ImageKit: browser uploads, optimized images, private lesson videos via signed URLs |
| Monitoring | Sentry: errors, tracing, Session Replay, Seer |
| Hosting | Cloudways Velocity (managed Node.js) |

## 1. Accounts and keys

Copy `.env.example` to `.env.local` and fill it in:

1. **Neon**: create a project in **aws-eu-central-1**. Use a dev branch for local work and copy its connection string to `DATABASE_URL`.
   - Enable **Auth**, copy the Auth URL to `NEON_AUTH_BASE_URL`, and add Google as a provider.
   - Set `NEON_AUTH_COOKIE_SECRET` to any random string of 32+ characters.
   - Enable **Realtime** and copy `NEON_REALTIME_SECRET` and the WebSocket URL (`NEXT_PUBLIC_NEON_REALTIME_URL`). Add `http://localhost:3000` to its allowed origins. Without Realtime, the trainer dashboard falls back to refreshing every 15 seconds.
2. **Paystack** (test mode): copy the secret key, then create a monthly **₦5,000** plan and copy its plan code.
3. **Stream**: create an app and copy the API key and secret. Chat and video share them.
4. **ImageKit**: copy the URL endpoint, public key and private key.
5. **Sentry**: create a Next.js project and copy the DSN, org and project slugs, and an auth token for source maps. For the Seer demo, connect GitHub in Sentry.

## 2. Run locally

```bash
npm install
npm run db:migrate    # apply drizzle/0000_init.sql to Neon
                      # (after schema changes: npm run db:generate, then db:migrate)
npm run db:seed       # optional demo trainers, programs and slots
npm run dev
```

**Paystack webhooks** need a public URL. Run a tunnel such as `ngrok http 3000`, then set the Paystack test webhook URL to `https://<tunnel>/api/webhooks/paystack`. Payments also confirm on the callback page, so checkout works without the tunnel. Subscription lifecycle events need the webhook.

Seed media (optional): upload sample images and a short MP4 to ImageKit (mark the video **private**), then set `SEED_IMAGE_BASE` and `SEED_VIDEO_PATH` before seeding. See `scripts/seed.ts`.

## 3. How the important parts work

- **Access rules** ([src/lib/access.ts](src/lib/access.ts)): the first lesson of each program is free. Other lessons need a membership whose `current_period_end` is in the future, so a cancelled member keeps access until the month ends. Trainers always see their own lessons.
- **Payments** ([src/lib/payments.ts](src/lib/payments.ts)): `fulfillPayment(reference)` verifies with Paystack and is idempotent. Both the callback page and the webhook call it.
  - Webhooks are HMAC-SHA512 verified and de-duplicated in `webhook_events`.
  - Earnings have a unique `booking_id`, so a payment is never credited twice.
- **Booking** ([src/app/trainers/[slug]/actions.ts](src/app/trainers/[slug]/actions.ts)): booking locks the slot row, holds the slot for 15 minutes, takes the price from the DB, then redirects to Paystack. `bookings.slot_id` is unique, so a slot can never be double-booked.
- **Video calls** ([src/app/sessions/[bookingId]](src/app/sessions/[bookingId])): the Stream call id is the booking id, and the members are the client and trainer only. Join opens 10 minutes before the start and closes when the slot ends.
- **Realtime** ([src/lib/realtime.ts](src/lib/realtime.ts)): the server seals a trainer-scoped query, and the browser subscribes with `useLiveQuery`. Renewals go through `/api/trainer/live-bookings`, which re-checks the session.
- **Uploads** ([src/components/uploader.tsx](src/components/uploader.tsx)): the browser uploads straight to ImageKit with short-lived params from `/api/upload-auth`. Lesson videos are private and are only played through 1-hour signed URLs.

## 4. Deploy to Cloudways Velocity

1. Push this repo to GitHub.
2. In Cloudways Velocity, create a Node.js app from the repo. The Next.js preset uses `npm run build` and `npm start`.
3. Add every variable from `.env.example`, with `NEXT_PUBLIC_APP_URL` set to your production URL. Use the Neon **main** branch connection string.
4. Run `npm run db:migrate` (and optionally `npm run db:seed`) against production once.
5. Point the external services at production:
   - Paystack webhook URL: `https://<domain>/api/webhooks/paystack`
   - Neon Auth trusted domain, plus the Google OAuth redirect URI for your domain
   - Neon Realtime allowed origins: add your domain

## 5. Verification checklist

- [ ] Visitor: search and filter trainers, open a program, play lesson 1. Lesson 2 shows the paywall.
- [ ] Trainer signs up, onboards, creates a program, uploads a cover and a lesson video, publishes, and adds a slot.
- [ ] Client signs up with Google, subscribes with a Paystack test card, and lesson 2 now plays.
- [ ] Client messages the trainer, with a thread reply and a reaction.
- [ ] Client books the slot and pays. The trainer dashboard updates live and shows 90% net.
- [ ] Resending the same webhook from Paystack creates no duplicate earnings.
- [ ] Both join the video call inside the join window.
- [ ] Client cancels the membership: status is non-renewing and access remains.
- [ ] "Send test error to Sentry" on the trainer overview shows up in Sentry with a Replay.
