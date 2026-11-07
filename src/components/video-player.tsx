"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Maximize, Pause, Play, Settings, Volume2 } from "lucide-react";

/**
 * UI-only player. Simulates playback with a timer; the real one will play a
 * signed ImageKit URL in a <video> element.
 */
export function VideoPlayer({ poster, durationMin, title }: { poster: string; durationMin: number; title: string }) {
  const total = durationMin * 60;
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setElapsed((s) => (s + 1 >= total ? 0 : s + 1)), 1000);
    return () => clearInterval(t);
  }, [playing, total]);

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const pct = (elapsed / total) * 100;

  return (
    <div className="group relative aspect-video overflow-hidden rounded-2xl border border-border bg-black text-foreground dark">
      <Image src={poster} alt={title} fill priority sizes="(min-width: 1024px) 66vw, 100vw" className={playing ? "object-cover opacity-90" : "object-cover opacity-60"} />
      {!playing && (
        <button onClick={() => setPlaying(true)} className="absolute inset-0 grid place-items-center" aria-label="Play lesson">
          <span className="glow grid size-20 place-items-center rounded-full bg-primary text-primary-foreground transition group-hover:scale-110">
            <Play className="ml-1 size-8 fill-current" />
          </span>
        </button>
      )}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent px-4 pb-3 pt-10">
        <div
          className="relative mb-3 h-1.5 cursor-pointer rounded-full bg-white/20"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            setElapsed(Math.round(((e.clientX - rect.left) / rect.width) * total));
          }}
        >
          <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
          <span className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" style={{ left: `${pct}%` }} />
        </div>
        <div className="flex items-center gap-4 text-white">
          <button onClick={() => setPlaying((p) => !p)} aria-label={playing ? "Pause" : "Play"}>
            {playing ? <Pause className="size-5 fill-current" /> : <Play className="size-5 fill-current" />}
          </button>
          <Volume2 className="size-5" />
          <span className="text-xs tabular-nums">{fmt(elapsed)} / {fmt(total)}</span>
          <span className="ml-auto flex items-center gap-4">
            <span className="rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-bold">HD</span>
            <Settings className="size-5" />
            <Maximize className="size-5" />
          </span>
        </div>
      </div>
    </div>
  );
}
