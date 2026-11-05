import { and, countDistinct, eq } from "drizzle-orm";
import { Users } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { bookings, db, enrollments, profiles, programs } from "@/db";
import { requireTrainer } from "@/lib/session";

/** Clients = anyone with a paid session with you, or enrolled in one of your programs. */
export default async function ClientsPage() {
  const user = await requireTrainer();

  const [sessionClients, programClients] = await Promise.all([
    db
      .select({ id: profiles.id, name: profiles.name, email: profiles.email, n: countDistinct(bookings.id) })
      .from(bookings)
      .innerJoin(profiles, eq(profiles.id, bookings.clientId))
      .where(and(eq(bookings.trainerId, user.id), eq(bookings.status, "paid")))
      .groupBy(profiles.id),
    db
      .select({ id: profiles.id, name: profiles.name, email: profiles.email, n: countDistinct(enrollments.programId) })
      .from(enrollments)
      .innerJoin(programs, eq(programs.id, enrollments.programId))
      .innerJoin(profiles, eq(profiles.id, enrollments.userId))
      .where(eq(programs.trainerId, user.id))
      .groupBy(profiles.id),
  ]);

  const clients = new Map<string, { name: string; email: string; sessions: number; programs: number }>();
  for (const c of sessionClients) clients.set(c.id, { name: c.name, email: c.email, sessions: c.n, programs: 0 });
  for (const c of programClients) {
    const existing = clients.get(c.id);
    clients.set(c.id, { name: c.name, email: c.email, sessions: existing?.sessions ?? 0, programs: c.n });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Clients</h1>
      {clients.size === 0 ? (
        <EmptyState icon={Users} title="No clients yet" description="Clients appear here when they book a session or start one of your programs." />
      ) : (
        <ul className="divide-y rounded-2xl border bg-card">
          {[...clients.entries()].map(([id, c]) => (
            <li key={id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-sm text-muted-foreground">{c.email}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                {c.sessions} sessions · {c.programs} programs
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
