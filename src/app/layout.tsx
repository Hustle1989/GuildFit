import type { Metadata } from "next";
import { Caveat, Geist_Mono, Outfit } from "next/font/google";
import { THEME_SCRIPT } from "@/lib/theme-script";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// Mock data uses times relative to "now" (e.g. a session starting in 5 minutes),
// so render per request instead of freezing them at build time.
export const dynamic = "force-dynamic";

const sans = Outfit({ variable: "--font-sans", subsets: ["latin"] });
const script = Caveat({ variable: "--font-script", subsets: ["latin"], weight: ["600", "700"] });
const mono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: { default: "GuildFit: train with the best, anywhere", template: "%s · GuildFit" },
  description:
    "Elite personal trainers, step-by-step video programs and 1:1 coaching calls, all in one place and built around your schedule.",
  openGraph: { siteName: "GuildFit", type: "website" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The inline script may swap "dark" for light before hydration, hence suppressHydrationWarning.
    <html lang="en" className={`dark ${sans.variable} ${script.variable} ${mono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-full">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
