import Link from "next/link";
import { MessageCircle, Video } from "lucide-react";
import { StatusPill } from "@/components/app-ui";
import { UserAvatar } from "@/components/shared";
import { buttonVariants } from "@/components/ui/button";
import { cn, dateParts, formatNaira, relativeStart, sessionState } from "@/lib/utils";

/** Calendar badge: "NOV / 9". */
export function DateBadge({ date, className }: { date: Date | string; className?: string }) {
  const { month, day } = dateParts(date);
  return (
    <span className={cn("flex size-14 shrink-0 flex-col items-center justify-center rounded-xl border border-primary/20 bg-primary/10", className)}>
      <span className="text-[10px] font-semibold tracking-wider text-primary">{month}</span>
      <span className="text-xl font-bold leading-none">{day}</span>
    </span>
  );
}

/** A client's 1:1 session: date badge, coach, time, message + join actions. */
export function SessionCard({
  id,
  person,
  startsAt,
  durationMin,
  amountKobo,
  messagesHref = "/messages",
}: {
  id: string;
  person: { name: string; image: string };
  startsAt: Date;
  durationMin: number;
  amountKobo?: number;
  messagesHref?: string;
}) {
  const state = sessionState(startsAt, durationMin);
  const { weekday, time } = dateParts(startsAt);
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
      <DateBadge date={startsAt} />
      <UserAvatar src={person.image} name={person.name} size={40} className="hidden sm:inline-grid" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold">Session with {person.name}</p>
        <p className="truncate text-sm text-muted-foreground">
          {state === "joinable" ? (
            <span className="font-medium text-primary">{relativeStart(startsAt, durationMin)}</span>
          ) : (
            `${weekday} ${time}`
          )}{" "}
          · {durationMin} min{amountKobo ? ` · ${formatNaira(amountKobo)}` : ""}
        </p>
      </div>
      {state === "ended" ? (
        <StatusPill tone="muted">Completed</StatusPill>
      ) : (
        <>
          <Link
            href={messagesHref}
            aria-label={`Message ${person.name}`}
            className="grid size-9 shrink-0 place-items-center rounded-full border border-border text-muted-foreground transition hover:border-primary/50 hover:text-primary"
          >
            <MessageCircle className="size-4" />
          </Link>
          <Link href={`/sessions/${id}`} className={buttonVariants({ className: "h-9 shrink-0 gap-1.5 px-3.5 font-semibold" })}>
            <Video /> Join call
          </Link>
        </>
      )}
    </div>
  );
}
