import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, Search } from "lucide-react";
import { InitialsAvatar, PageHeader, StatusPill } from "@/components/app-ui";
import { listTrainerClients } from "@/lib/queries";
import { requireTrainer } from "@/lib/session";
import { timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "Clients" };

export default async function ClientsPage() {
  const user = await requireTrainer();
  const clients = await listTrainerClients(user.id);
  return (
    <>
      <PageHeader title="Clients" subtitle="Everyone who's booked a session with you or started one of your programs." />

      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <p className="font-semibold">{clients.length} clients</p>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input placeholder="Search clients" className="h-9 w-full rounded-lg border border-border bg-background/50 pl-9 pr-3 text-sm outline-none focus:border-primary/50" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-5 py-3 font-medium">Client</th>
                <th className="px-5 py-3 font-medium">Goal</th>
                <th className="px-5 py-3 text-right font-medium">Sessions</th>
                <th className="px-5 py-3 text-right font-medium">Programs</th>
                <th className="px-5 py-3 font-medium">Last active</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                    No clients yet. They appear here when someone books a session or starts one of your programs.
                  </td>
                </tr>
              )}
              {clients.map((c) => (
                <tr key={c.id} className="border-b border-border/60 transition last:border-0 hover:bg-foreground/[0.02]">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <InitialsAvatar name={c.name} size={38} />
                      <div>
                        <p className="font-medium">{c.name}</p>
                        <p className="text-xs text-muted-foreground">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">{c.goal ? <StatusPill tone="muted">{c.goal}</StatusPill> : <span className="text-muted-foreground">—</span>}</td>
                  <td className="px-5 py-3.5 text-right tabular-nums">{c.sessions}</td>
                  <td className="px-5 py-3.5 text-right tabular-nums">{c.programs}</td>
                  <td className="px-5 py-3.5 text-muted-foreground">{timeAgo(c.lastActive)}</td>
                  <td className="px-5 py-3.5 text-right">
                    <Link href="/trainer/messages" className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:border-primary hover:text-primary">
                      <MessageCircle className="size-3.5" /> Message
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
