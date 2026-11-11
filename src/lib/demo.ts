/**
 * Seeded demo accounts (see scripts/seed.ts). The sign-in page's "Demo
 * shortcuts" sign in as these. Set DEMO_LOGIN=off to hide the shortcuts
 * (do that in production).
 */
export const DEMO_PASSWORD = process.env.SEED_DEMO_PASSWORD ?? "GuildFit-demo-2026";
export const DEMO_ACCOUNTS = {
  client: "ada@guildfit.test",
  trainer: "amara@guildfit.test",
} as const;
export const demoLoginEnabled = () => process.env.DEMO_LOGIN !== "off";
