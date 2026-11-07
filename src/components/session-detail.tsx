import Link from "next/link";
import { ArrowLeft, CalendarDays, Clock, Receipt } from "lucide-react";
import { CallRoom } from "@/components/call-room";
import { StatusPill } from "@/components/app-ui";
import { formatDate, formatNaira, joinWindow, relativeStart, sessionState } from "@/lib/utils";

type Person = { name: string; image: string };

export function SessionDetail({
  me,
  other,
  startsAt,
  durationMin,
  amountKobo,
  backHref,
}: {
  me: Person;
  other: Person;
  startsAt: Date;
  durationMin: number;
  amountKobo: number;
  backHref: string;
}) {
  const state = sessionState(startsAt, durationMin);
  const { opensAt } = joinWindow(startsAt, durationMin);

  return (
    <div className="space-y-6">
      <Link href={backHref} className="flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="size-4" /> Back
      </Link>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl">Session with {other.name}</h1>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><CalendarDays className="size-4 text-primary" /> {formatDate(startsAt, "day")}</span>
            <span className="flex items-center gap-1.5"><Clock className="size-4 text-primary" /> {formatDate(startsAt, "time")} · {durationMin} min</span>
            <span className="flex items-center gap-1.5"><Receipt className="size-4 text-primary" /> {formatNaira(amountKobo)} · Paid</span>
          </div>
        </div>
        <StatusPill tone={state === "joinable" ? "green" : "muted"}>
          {state === "ended" ? "Completed" : relativeStart(startsAt, durationMin)}
        </StatusPill>
      </div>
      <CallRoom me={me} other={other} state={state} opensAtLabel={formatDate(opensAt, "time")} backHref={backHref} />
    </div>
  );
}
