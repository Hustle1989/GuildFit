"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  FaceSlightlySmilingPlus,
  MessageSquareReply,
  Paperclip,
  Search,
  Send,
  Video,
  X,
} from "lucide-react";
import type { Conversation, Message } from "@/lib/mock-data";
import { cn, formatDate } from "@/lib/utils";

type People = Record<string, { name: string; image: string; role: "trainer" | "client" }>;
const QUICK_REACTIONS = ["👍", "🔥", "💪", "❤️", "😂"];

/**
 * UI-only version of the Stream Chat screen: channel list, messages with
 * reactions, threaded replies and a composer. State is local to the page.
 */
export function Messenger({
  meId,
  people,
  initialConversations,
  callHref,
}: {
  meId: string;
  people: People;
  initialConversations: Conversation[];
  callHref: string;
}) {
  const [conversations, setConversations] = useState(initialConversations);
  const [activeId, setActiveId] = useState(initialConversations[0]?.id);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"list" | "chat">("list");
  const [query, setQuery] = useState("");

  const active = conversations.find((c) => c.id === activeId);
  const other = active ? people[active.withId] : undefined;
  const threadParent = active?.messages.find((m) => m.id === threadId);

  const filtered = useMemo(
    () => conversations.filter((c) => people[c.withId]?.name.toLowerCase().includes(query.toLowerCase())),
    [conversations, people, query],
  );

  function update(fn: (c: Conversation) => Conversation) {
    setConversations((all) => all.map((c) => (c.id === activeId ? fn(c) : c)));
  }

  function send(text: string, parentId?: string) {
    const message: Message = { id: crypto.randomUUID(), authorId: meId, text, at: new Date() };
    update((c) => ({
      ...c,
      messages: parentId
        ? c.messages.map((m) => (m.id === parentId ? { ...m, replies: [...(m.replies ?? []), message] } : m))
        : [...c.messages, message],
    }));
  }

  function react(messageId: string, emoji: string) {
    update((c) => ({
      ...c,
      messages: c.messages.map((m) => {
        if (m.id !== messageId) return m;
        const existing = m.reactions?.find((r) => r.emoji === emoji);
        const reactions = existing
          ? m.reactions!
              .map((r) => (r.emoji === emoji ? { ...r, count: r.count + (r.mine ? -1 : 1), mine: !r.mine } : r))
              .filter((r) => r.count > 0)
          : [...(m.reactions ?? []), { emoji, count: 1, mine: true }];
        return { ...m, reactions };
      }),
    }));
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] min-h-[560px] overflow-hidden rounded-2xl border border-border bg-card">
      {/* channel list */}
      <aside className={cn("w-full shrink-0 flex-col border-r border-border md:flex md:w-80", mobileView === "list" ? "flex" : "hidden")}>
        <div className="border-b border-border p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search conversations"
              className="h-10 w-full rounded-lg border border-border bg-background/50 pl-9 pr-3 text-sm outline-none focus:border-primary/50"
            />
          </div>
        </div>
        <ul className="flex-1 overflow-y-auto">
          {filtered.map((c) => {
            const person = people[c.withId];
            const last = c.messages[c.messages.length - 1];
            return (
              <li key={c.id}>
                <button
                  onClick={() => {
                    setActiveId(c.id);
                    setThreadId(null);
                    setMobileView("chat");
                    setConversations((all) => all.map((x) => (x.id === c.id ? { ...x, unread: 0 } : x)));
                  }}
                  className={cn("flex w-full items-center gap-3 border-l-2 px-4 py-3.5 text-left transition", c.id === activeId ? "border-primary bg-primary/10" : "border-transparent hover:bg-foreground/[0.03]")}
                >
                  <Avatar src={person.image} name={person.name} online={person.role === "trainer"} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate font-semibold">{person.name}</span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">{formatDate(last.at, "time")}</span>
                    </span>
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm text-muted-foreground">{last.authorId === meId ? "You: " : ""}{last.text}</span>
                      {c.unread > 0 && <span className="grid min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground">{c.unread}</span>}
                    </span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* conversation */}
      {active && other && (
        <section className={cn("min-w-0 flex-1 flex-col md:flex", mobileView === "chat" ? "flex" : "hidden")}>
          <header className="flex items-center gap-3 border-b border-border px-4 py-3">
            <button className="md:hidden" onClick={() => setMobileView("list")} aria-label="Back to conversations"><ArrowLeft className="size-5" /></button>
            <Avatar src={other.image} name={other.name} online={other.role === "trainer"} />
            <div className="flex-1">
              <p className="font-semibold">{other.name}</p>
              <p className="text-xs text-primary">{other.role === "trainer" ? "Coach · Online" : "Client"}</p>
            </div>
            <Link href={callHref} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:border-primary hover:text-primary">
              <Video className="size-4" /> <span className="hidden sm:inline">Video session</span>
            </Link>
          </header>

          <div className="flex-1 space-y-5 overflow-y-auto px-4 py-6">
            <p className="text-center text-xs text-muted-foreground">This is the start of your conversation with {other.name}</p>
            {active.messages.map((m) => (
              <Bubble key={m.id} message={m} mine={m.authorId === meId} author={people[m.authorId]} onReact={(e) => react(m.id, e)} onThread={() => setThreadId(m.id)} />
            ))}
          </div>

          <Composer placeholder={`Message ${other.name.split(" ")[0]}…`} onSend={(text) => send(text)} />
        </section>
      )}

      {/* thread */}
      {threadParent && (
        <aside className="hidden w-80 shrink-0 flex-col border-l border-border lg:flex">
          <header className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="font-semibold">Thread</p>
            <button onClick={() => setThreadId(null)} aria-label="Close thread"><X className="size-4" /></button>
          </header>
          <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5">
            <Bubble message={{ ...threadParent, replies: undefined }} mine={threadParent.authorId === meId} author={people[threadParent.authorId]} compact />
            <p className="flex items-center gap-2 text-xs text-muted-foreground">
              {threadParent.replies?.length ?? 0} replies <span className="h-px flex-1 bg-foreground/8" />
            </p>
            {threadParent.replies?.map((r) => (
              <Bubble key={r.id} message={r} mine={r.authorId === meId} author={people[r.authorId]} compact />
            ))}
          </div>
          <Composer placeholder="Reply in thread…" onSend={(text) => send(text, threadParent.id)} />
        </aside>
      )}
    </div>
  );
}

function Avatar({ src, name, online }: { src: string; name: string; online?: boolean }) {
  return (
    <span className="relative size-10 shrink-0">
      <span className="relative block size-10 overflow-hidden rounded-full">
        <Image src={src} alt={name} fill sizes="80px" className="object-cover" />
      </span>
      {online && <span className="absolute bottom-0 right-0 size-3 rounded-full border-2 border-card bg-primary" />}
    </span>
  );
}

function Bubble({
  message,
  mine,
  author,
  onReact,
  onThread,
  compact,
}: {
  message: Message;
  mine: boolean;
  author: { name: string; image: string };
  onReact?: (emoji: string) => void;
  onThread?: () => void;
  compact?: boolean;
}) {
  const [picker, setPicker] = useState(false);
  return (
    <div className={cn("group flex gap-3", mine && "flex-row-reverse")}>
      {!mine && (
        <span className="relative size-8 shrink-0 overflow-hidden rounded-full">
          <Image src={author.image} alt={author.name} fill sizes="64px" className="object-cover" />
        </span>
      )}
      <div className={cn("flex max-w-[80%] flex-col", mine && "items-end")}>
        <div className="relative">
          <div className={cn("rounded-2xl px-4 py-2.5 text-sm leading-relaxed", mine ? "rounded-br-md bg-primary text-primary-foreground" : "rounded-bl-md bg-secondary")}>
            {message.text}
          </div>
          {!compact && (
            <div className={cn("absolute top-1/2 hidden -translate-y-1/2 gap-1 group-hover:flex", mine ? "right-full mr-2" : "left-full ml-2")}>
              <button onClick={() => setPicker((p) => !p)} className="grid size-7 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:text-primary" aria-label="Add reaction">
                <FaceSlightlySmilingPlus className="size-4" />
              </button>
              <button onClick={onThread} className="grid size-7 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:text-primary" aria-label="Reply in thread">
                <MessageSquareReply className="size-4" />
              </button>
            </div>
          )}
          {picker && (
            <div className={cn("absolute -top-11 z-10 flex gap-1 rounded-full border border-border bg-popover p-1 shadow-xl", mine ? "right-0" : "left-0")}>
              {QUICK_REACTIONS.map((e) => (
                <button key={e} onClick={() => { onReact?.(e); setPicker(false); }} className="grid size-8 place-items-center rounded-full text-lg hover:bg-foreground/10">
                  {e}
                </button>
              ))}
            </div>
          )}
        </div>

        {(message.reactions?.length ?? 0) > 0 && (
          <div className="mt-1.5 flex gap-1">
            {message.reactions!.map((r) => (
              <button
                key={r.emoji}
                onClick={() => onReact?.(r.emoji)}
                className={cn("flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs", r.mine ? "border-primary/50 bg-primary/15" : "border-border bg-card")}
              >
                {r.emoji} <span className="text-muted-foreground">{r.count}</span>
              </button>
            ))}
          </div>
        )}

        <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground">
          <span>{formatDate(message.at, "time")}</span>
          {!compact && (message.replies?.length ?? 0) > 0 && (
            <button onClick={onThread} className="flex items-center gap-1 font-semibold text-primary hover:underline">
              <MessageSquareReply className="size-3" /> {message.replies!.length} {message.replies!.length === 1 ? "reply" : "replies"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Composer({ placeholder, onSend }: { placeholder: string; onSend: (text: string) => void }) {
  const [text, setText] = useState("");
  return (
    <form
      className="flex items-center gap-2 border-t border-border p-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onSend(text.trim());
        setText("");
      }}
    >
      <button type="button" className="grid size-9 place-items-center rounded-lg text-muted-foreground hover:text-primary" aria-label="Attach file">
        <Paperclip className="size-4" />
      </button>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-background/50 px-3 text-sm outline-none focus:border-primary/50"
      />
      <button type="submit" disabled={!text.trim()} className="grid size-10 place-items-center rounded-lg bg-primary text-primary-foreground transition disabled:opacity-40" aria-label="Send">
        <Send className="size-4" />
      </button>
    </form>
  );
}
