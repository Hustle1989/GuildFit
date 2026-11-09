# GuildFit

A personal-training platform. Clients find trainers, buy one monthly membership that unlocks every workout program, watch video lessons, chat with trainers and book paid 1:1 video sessions. Trainers manage programs, availability, clients and earnings.

See [PLAN.md](PLAN.md) for the full spec.

## Status

| Concern | Service | State |
|---|---|---|
| App | Next.js 16 (App Router, server actions), Tailwind v4, shadcn/ui | ✅ |
| Database | Neon (Lakebase Postgres) + Drizzle ORM over `pg` | ✅ live, seeded |
| Auth | Neon Auth (Managed Better Auth): email/password + Google | ✅ live |
| Realtime | Neon Realtime: live bookings feed on the trainer dashboard | ✅ live |
| Payments | Paystack: membership + 1:1 sessions | ⏳ simulated: checkout writes the same rows Paystack will |
| Chat & video | Stream | ⏳ simulated in the browser (sample conversations, mock call room) |
| Media | ImageKit | ⏳ uploads preview locally; images are Unsplash URLs |
| Monitoring | Sentry | ⏳ configured, needs a DSN |
| Hosting | Cloudways Velocity | ⏳ |

Light and dark mode: dark is the default; the sun/moon button switches and remembers it. `?theme=light|dark` forces one.

## 1. Set up Neon

This repo is linked to the Neon project **GuildFit** (`dark-cloud-93391236`, branch `production`, aws-us-east-2). [neon.ts](neon.ts) declares the services.

```bash
npm i -g neon            # Neon CLI
neon login               # once, in a browser
neon link --project-id dark-cloud-93391236 --branch production   # fresh clone only (.neon is git-ignored)
neon deploy              # applies neon.ts and pulls DATABASE_URL, NEON_AUTH_*, NEON_REALTIME_* … into .env.local
```

Then add the app settings to `.env.local` (see [.env.example](.env.example)):

```bash
NEON_AUTH_COOKIE_SECRET=<openssl rand -base64 32>
NEXT_PUBLIC_NEON_REALTIME_URL=$NEON_REALTIME_URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 2. Run locally

```bash
npm install
npm run db:migrate    # apply drizzle/ migrations (uses DATABASE_URL_UNPOOLED)
npm run db:seed       # demo accounts + data; safe to re-run (refreshes demo-owned rows)
npm run dev
```

After schema changes: `npm run db:generate`, then `npm run db:migrate`.

### Demo accounts

`npm run db:seed` creates real Neon Auth accounts (password `GuildFit-demo-2026`, or `SEED_DEMO_PASSWORD`):

| Who | Email | What they have |
|---|---|---|
| Trainer | `amara@guildfit.test` | 3 programs (1 draft), a week of slots, 8 weeks of paid sessions and earnings |
| Client | `ada@guildfit.test` | Active membership, 3 programs in progress, a session starting in ~5 minutes |
| Others | `tunde@`, `zainab@`, `chidi@`, `kemi@`, `david@` (trainers); `emeka@`, `funmi@`, `grace@`, `daniel@`, `sarah@`, `michael@` (clients) | |

The **Client** / **Trainer** shortcuts on `/sign-in` sign in as Ada and Amara (hide them with `DEMO_LOGIN=off`). Times are relative to when you seed, so re-run the seed before a demo to get a session in the join window.

**See realtime work:** sign in as Amara in one browser (`/trainer`), as any client in another (private window), and book one of Amara's slots from `/trainers/amara-okafor`. The booking appears in Amara's **Live bookings** feed with a toast, no refresh.

## 3. How the important parts work

- **Auth** ([src/lib/auth/server.ts](src/lib/auth/server.ts), [src/proxy.ts](src/proxy.ts), [src/lib/session.ts](src/lib/session.ts))
  - `createNeonAuth` from `@neon/auth/next/server`; `/api/auth/[...path]` proxies browser calls to Neon Auth.
  - `proxy.ts` runs `auth.middleware()` on every page: it refreshes the session, finishes the Google sign-in hand-off, and redirects signed-out visitors to `/sign-in`. Public pages are listed in `PUBLIC_ROUTES`.
  - Email sign-in/up are server actions ([src/app/(auth)/actions.ts](src/app/(auth)/actions.ts)); Google uses `authClient.signIn.social`. Sign-out is a full page load.
  - Users live in Neon Auth's `neon_auth` schema. `profiles.id` is the Auth user id; the role (client/trainer) is chosen once at `/onboarding`.
  - Every page and action re-checks the session (`requireClient`, `requireTrainer`); the proxy is a convenience, not the boundary.
- **Data** ([src/db/schema.ts](src/db/schema.ts), [src/lib/queries.ts](src/lib/queries.ts), [src/lib/actions.ts](src/lib/actions.ts), [src/app/trainer/actions.ts](src/app/trainer/actions.ts))
  - Money is integer kobo. `bookings.slot_id` is unique, so a slot can't be double-booked; `earnings.booking_id` is unique, so a payment is credited once.
  - Booking locks the slot row (`SELECT … FOR UPDATE`), rejects paid slots and live 15-minute checkout holds, then records the booking and the trainer's 90% net in one transaction.
  - Lesson access: the first lesson is free; the rest need a membership with `current_period_end` in the future (cancelled members keep access until then). Trainers see their own lessons.
- **Realtime** ([src/lib/realtime.ts](src/lib/realtime.ts), [src/components/live-bookings.tsx](src/components/live-bookings.tsx))
  - The trainer overview runs `liveBookingsQuery(trainerId)` for the first render and seals the same query with `NEON_REALTIME_SECRET`; the browser subscribes with `useLiveQuery`.
  - Renewals go through `POST /api/trainer/live-bookings`, which re-checks the session and that the page's user is still the signed-in user.

## 4. Deploy to Cloudways Velocity

1. Create a Node.js app from this repo (Next.js preset: `npm run build`, `npm start`).
2. Add the variables from `.env.local` (run `neon env pull` for the Neon ones), with `NEXT_PUBLIC_APP_URL` set to your domain and `DEMO_LOGIN=off`.
3. Run `npm run db:migrate` once against the branch you deploy.
4. In Neon: add your domain as an Auth trusted domain (`neon neon-auth domain add https://your-domain`), switch Google sign-in to your own OAuth client, and configure custom SMTP for auth emails.

## 5. Verification checklist

- [x] Sign up, onboarding, sign out, sign in, wrong-password message, session survives reload, protected routes redirect.
- [x] Visitor sees lesson 2 paywalled; after subscribing, lesson 2 plays and "Mark complete" persists.
- [x] Client books a slot; the trainer dashboard shows it live and earnings show 90% net.
- [x] Trainer adds a slot and creates a program.
- [ ] Paystack checkout, webhook replay creates no duplicate earnings.
- [ ] Stream chat with thread replies and reactions; both sides join the video call in the window.
- [ ] ImageKit uploads and private lesson playback.
- [ ] A test error shows up in Sentry with a Replay.
