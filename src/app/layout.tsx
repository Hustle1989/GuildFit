import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { Navbar } from "@/components/navbar";
import "./globals.css";

// The navbar reads the session cookie, so every page renders per request.
export const dynamic = "force-dynamic";

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: { default: "GuildFit: train with the best", template: "%s · GuildFit" },
  description:
    "Find elite personal trainers, follow premium workout programs, chat with your coach and book 1:1 video sessions.",
  openGraph: { siteName: "GuildFit", type: "website" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t py-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} GuildFit. Built with Next.js, Neon, Paystack, Stream, ImageKit &amp; Sentry.
        </footer>
        <Toaster theme="dark" richColors position="top-center" />
      </body>
    </html>
  );
}
