"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export type Theme = "light" | "dark";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

/** The current theme, read from the class on <html> (the inline script sets it first). */
export function useTheme(): Theme {
  return useSyncExternalStore(
    subscribe,
    () => (document.documentElement.classList.contains("dark") ? "dark" : "light"),
    () => "dark",
  );
}

export function setTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
  try {
    localStorage.setItem("theme", theme);
  } catch {
    // private mode: the choice just won't persist
  }
}

/** Sun in dark mode (switch to light), moon in light mode (switch to dark). */
export function ThemeToggle({ className }: { className?: string }) {
  const theme = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-lg text-muted-foreground transition hover:bg-foreground/5 hover:text-foreground",
        className,
      )}
    >
      <Sun className="hidden size-4.5 dark:block" />
      <Moon className="size-4.5 dark:hidden" />
    </button>
  );
}
