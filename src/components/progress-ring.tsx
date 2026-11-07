/**
 * Meter as a ring: the fill carries the value, the track is a lighter step of
 * the same green so the state reads across the whole circle.
 */
export function ProgressRing({
  value,
  size = 140,
  stroke = 12,
  label,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }} role="meter" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label ?? "Progress"}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--primary)" strokeOpacity={0.15} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--primary)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct / 100)}
          style={{ filter: "drop-shadow(0 0 8px oklch(0.84 0.19 152 / 0.45))" }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-3xl font-bold leading-none">{pct}%</p>
        {label && <p className="mt-1 text-[11px] text-muted-foreground">{label}</p>}
      </div>
    </div>
  );
}
