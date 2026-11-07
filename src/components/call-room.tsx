"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CircleCheck, Clock, Mic, MicOff, MonitorUp, PhoneOff, ShieldCheck, Video, VideoOff } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Person = { name: string; image: string };

/**
 * UI-only Stream video call. Lobby -> in call -> ended. The real version uses
 * @stream-io/video-react-sdk with call id = booking id.
 */
export function CallRoom({
  me,
  other,
  state,
  opensAtLabel,
  backHref,
}: {
  me: Person;
  other: Person;
  state: "upcoming" | "joinable" | "ended";
  opensAtLabel: string;
  backHref: string;
}) {
  const [phase, setPhase] = useState<"lobby" | "call" | "ended">(state === "ended" ? "ended" : "lobby");
  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(true);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (phase !== "call") return;
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const clock = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  if (phase === "ended") {
    return (
      <div className="rounded-3xl border border-border bg-card p-10 text-center">
        <span className="glow mx-auto grid size-16 place-items-center rounded-full bg-primary text-primary-foreground"><CircleCheck className="size-8" /></span>
        <h2 className="mt-6 text-2xl font-bold">Session complete</h2>
        <p className="mt-2 text-muted-foreground">Great work with {other.name.split(" ")[0]}. Keep the momentum going.</p>
        <Link href={backHref} className={buttonVariants({ size: "lg", className: "mt-6 h-11 px-6" })}>Back to dashboard</Link>
      </div>
    );
  }

  if (phase === "lobby") {
    return (
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="relative aspect-video overflow-hidden rounded-3xl border border-border bg-black text-foreground dark">
          {cam ? (
            <Image src={me.image} alt="Your camera preview" fill sizes="60vw" className="object-cover" />
          ) : (
            <div className="grid h-full place-items-center text-muted-foreground"><VideoOff className="size-10" /></div>
          )}
          <span className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1 text-xs font-medium backdrop-blur">Camera preview</span>
          <div className="absolute inset-x-0 bottom-4 flex justify-center gap-3">
            <ToggleButton on={mic} onClick={() => setMic((v) => !v)} onIcon={Mic} offIcon={MicOff} label="microphone" />
            <ToggleButton on={cam} onClick={() => setCam((v) => !v)} onIcon={Video} offIcon={VideoOff} label="camera" />
          </div>
        </div>

        <div className="flex flex-col rounded-3xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <span className="relative size-14 overflow-hidden rounded-full">
              <Image src={other.image} alt={other.name} fill sizes="112px" className="object-cover" />
            </span>
            <div>
              <p className="text-sm text-muted-foreground">Your session with</p>
              <p className="text-xl font-bold">{other.name}</p>
            </div>
          </div>
          <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><ShieldCheck className="size-4 text-primary" /> Private call: only you two can join</li>
            <li className="flex items-center gap-2"><Clock className="size-4 text-primary" /> Opens 10 minutes before the start time</li>
          </ul>
          <div className="mt-auto pt-8">
            {state === "joinable" ? (
              <Button size="lg" className="glow h-12 w-full text-base font-semibold" onClick={() => setPhase("call")}>
                <Video /> Join call
              </Button>
            ) : (
              <>
                <Button size="lg" className="h-12 w-full text-base" disabled>Join opens at {opensAtLabel}</Button>
                <p className="mt-2 text-center text-xs text-muted-foreground">Come back a few minutes before your session.</p>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative aspect-video overflow-hidden rounded-3xl border border-border bg-black text-foreground dark">
      <Image src={other.image} alt={other.name} fill sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

      <div className="absolute left-4 top-4 flex items-center gap-2">
        <span className="flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold backdrop-blur">
          <span className="size-2 animate-pulse rounded-full bg-red-500" /> {clock}
        </span>
        <span className="rounded-full bg-black/60 px-3 py-1 text-xs backdrop-blur">{other.name}</span>
      </div>

      {/* self view */}
      <div className="absolute right-4 top-4 aspect-video w-32 overflow-hidden rounded-xl border-2 border-primary/60 bg-zinc-900 sm:w-48">
        {cam ? <Image src={me.image} alt="You" fill sizes="200px" className="object-cover" /> : <div className="grid h-full place-items-center"><VideoOff className="size-6 text-muted-foreground" /></div>}
        <span className="absolute bottom-1.5 left-1.5 flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px]">
          {!mic && <MicOff className="size-3 text-red-400" />} You
        </span>
      </div>

      <div className="absolute inset-x-0 bottom-5 flex justify-center gap-3">
        <ToggleButton on={mic} onClick={() => setMic((v) => !v)} onIcon={Mic} offIcon={MicOff} label="microphone" />
        <ToggleButton on={cam} onClick={() => setCam((v) => !v)} onIcon={Video} offIcon={VideoOff} label="camera" />
        <button className="grid size-12 place-items-center rounded-full bg-white/15 backdrop-blur transition hover:bg-white/25" aria-label="Share screen">
          <MonitorUp className="size-5" />
        </button>
        <button onClick={() => setPhase("ended")} className="grid h-12 place-items-center rounded-full bg-red-500 px-6 transition hover:bg-red-600" aria-label="Leave call">
          <PhoneOff className="size-5" />
        </button>
      </div>
    </div>
  );
}

function ToggleButton({
  on,
  onClick,
  onIcon: On,
  offIcon: Off,
  label,
}: {
  on: boolean;
  onClick: () => void;
  onIcon: typeof Mic;
  offIcon: typeof Mic;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={`${on ? "Turn off" : "Turn on"} ${label}`}
      className={cn("grid size-12 place-items-center rounded-full backdrop-blur transition", on ? "bg-white/15 hover:bg-white/25" : "bg-red-500/90 hover:bg-red-500")}
    >
      {on ? <On className="size-5" /> : <Off className="size-5" />}
    </button>
  );
}
