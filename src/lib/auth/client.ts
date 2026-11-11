"use client";

import { createAuthClient } from "@neon/auth/next";

// Talks to our own /api/auth/[...path] route, which proxies to Neon Auth.
export const authClient = createAuthClient();
