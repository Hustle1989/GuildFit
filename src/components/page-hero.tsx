/** Compact header band for catalog pages, with a soft green glow. */
export function PageHero({ eyebrow, title, subtitle, children }: { eyebrow: string; title: React.ReactNode; subtitle: string; children?: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="pointer-events-none absolute -top-40 left-1/3 size-[520px] rounded-full bg-primary/10 blur-[140px]" />
      <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-14 sm:px-6">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="font-display mt-3 text-4xl sm:text-6xl">{title}</h1>
        <p className="mt-4 max-w-xl text-muted-foreground">{subtitle}</p>
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
