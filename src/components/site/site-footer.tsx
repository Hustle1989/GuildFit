import Link from "next/link";
import { Logo } from "@/components/site/logo";

const COLUMNS = [
  { title: "Product", links: [["Trainers", "/trainers"], ["Programs", "/programs"], ["Pricing", "/pricing"], ["Become a coach", "/sign-up"]] },
  { title: "Company", links: [["About", "#"], ["Careers", "#"], ["Blog", "#"], ["Press", "#"]] },
  { title: "Support", links: [["Help center", "#"], ["Contact us", "#"], ["Privacy policy", "#"], ["Terms of service", "#"]] },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)_1.2fr]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">Elite trainers, video programs and 1:1 coaching calls, all in one place.</p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h3 className="mb-3 text-sm font-semibold">{col.title}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {col.links.map(([label, href]) => (
                <li key={label}>
                  <Link href={href} className="transition hover:text-primary">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="space-y-4 md:text-right">
          <div className="flex gap-2 md:justify-end">
            {SOCIALS.map(({ label, path }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="grid size-9 place-items-center rounded-full border border-border text-muted-foreground transition hover:border-primary hover:text-primary"
              >
                <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  {path}
                </svg>
              </a>
            ))}
          </div>
          <p className="text-sm font-semibold">#StrongerEveryDay</p>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} GuildFit. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

// Simple outline glyphs (lucide v1 dropped brand icons).
const SOCIALS = [
  { label: "Instagram", path: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" /></> },
  { label: "YouTube", path: <><rect x="2.5" y="5.5" width="19" height="13" rx="4" /><path d="M10 9.5v5l4.5-2.5z" fill="currentColor" /></> },
  { label: "TikTok", path: <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5M14 3c.5 2.5 2.5 4.5 5 4.5" /> },
  { label: "X", path: <path d="M4 4l16 16M20 4L4 20" /> },
];
