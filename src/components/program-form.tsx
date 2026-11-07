"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowLeft, ArrowUp, CloudUpload, ExternalLink, GripVertical, Loader2, Trash } from "lucide-react";
import { toast } from "sonner";
import { StatusPill } from "@/components/app-ui";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { dropzoneClass, ProgressBar, Uploader } from "@/components/uploader";
import { GOALS, type Program } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type DraftLesson = { id: string; title: string; durationMin: number; progress: number | null };

const MAX_VIDEO_BYTES = 200 * 1024 * 1024;
const fieldClass =
  "h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

/** Create or edit a program: details, lessons (video uploads), cover and visibility. UI-only. */
export function ProgramForm({ program }: { program?: Program }) {
  const router = useRouter();
  const isNew = !program;
  const [published, setPublished] = useState(program?.published ?? false);
  const [lessons, setLessons] = useState<DraftLesson[]>(
    program?.lessons.map((l) => ({ id: l.id, title: l.title, durationMin: l.durationMin, progress: null })) ?? [],
  );
  const [dragging, setDragging] = useState(false);
  const [pending, setPending] = useState(false);
  const timers = useRef(new Set<ReturnType<typeof setInterval>>());

  useEffect(() => {
    const running = timers.current;
    return () => running.forEach(clearInterval);
  }, []);

  const ready = lessons.filter((l) => l.progress === null).length;

  function addVideos(files: FileList | null) {
    for (const file of Array.from(files ?? [])) {
      if (!file.type.startsWith("video/")) {
        toast.error(`${file.name} isn't a video file.`);
        continue;
      }
      if (file.size > MAX_VIDEO_BYTES) {
        toast.error(`${file.name} is larger than 200 MB.`);
        continue;
      }
      const id = crypto.randomUUID();
      const title = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
      setLessons((ls) => [...ls, { id, title, durationMin: 12, progress: 0 }]);

      // Fake upload progress (later: direct upload to ImageKit as a private file).
      let value = 0;
      const timer = setInterval(() => {
        value += 6;
        const snapshot = Math.min(value, 100);
        if (snapshot < 100) {
          setLessons((ls) => ls.map((l) => (l.id === id ? { ...l, progress: snapshot } : l)));
          return;
        }
        clearInterval(timer);
        timers.current.delete(timer);
        setLessons((ls) => ls.map((l) => (l.id === id ? { ...l, progress: null } : l)));
        toast.success(`“${title}” uploaded`);
      }, 160);
      timers.current.add(timer);
    }
  }

  const move = (i: number, dir: -1 | 1) =>
    setLessons((ls) => {
      const next = [...ls];
      [next[i], next[i + dir]] = [next[i + dir], next[i]];
      return next;
    });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (isNew) {
          setPending(true);
          toast.success(published ? "Program created and published (demo)" : "Program created as a draft (demo)");
          setTimeout(() => router.push("/trainer/programs/p9"), 600);
        } else {
          toast.success("Changes saved");
        }
      }}
    >
      <Link href="/trainer/programs" className="mb-4 flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground">
        <ArrowLeft className="size-4" /> Programs
      </Link>

      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{isNew ? "New program" : program.title}</h1>
            {!isNew && (
              <StatusPill tone={published ? "green" : "muted"} dot={published}>
                {published ? "Published" : "Draft"}
              </StatusPill>
            )}
          </div>
          <p className="mt-1.5 text-muted-foreground">
            {isNew
              ? "Add the details, upload your lesson videos, then publish when you're ready."
              : `${ready} lessons · ${program.enrolled.toLocaleString()} enrolled`}
          </p>
        </div>
        <div className="flex gap-2">
          {isNew ? (
            <Link href="/trainer/programs" className={buttonVariants({ variant: "outline", className: "h-9 px-3.5" })}>
              Cancel
            </Link>
          ) : (
            <Link href={`/programs/${program.slug}`} className={buttonVariants({ variant: "outline", className: "h-9 px-3.5" })}>
              <ExternalLink /> Preview
            </Link>
          )}
          <Button type="submit" className="h-9 px-4 font-semibold" disabled={pending}>
            {pending && <Loader2 className="animate-spin" />}
            {isNew ? "Create program" : "Save changes"}
          </Button>
        </div>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-5">
          <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
            <h2 className="font-semibold">Details</h2>
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required defaultValue={program?.title} placeholder="e.g. 8-Week Strength Foundations" className="h-10" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                rows={3}
                defaultValue={program?.description}
                placeholder="What will clients achieve? Who is it for?"
                className="min-h-20"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="goal">Goal</Label>
                <select id="goal" name="goal" defaultValue={program?.goal ?? "strength"} className={fieldClass}>
                  {GOALS.map((g) => (
                    <option key={g.key} value={g.key}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="level">Level</Label>
                <select id="level" name="level" defaultValue={program?.level ?? "beginner"} className={fieldClass}>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="weeks">Length</Label>
                <div className={cn(fieldClass, "flex items-center gap-2 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50")}>
                  <input
                    id="weeks"
                    name="weeks"
                    type="number"
                    min={1}
                    max={52}
                    defaultValue={program?.weeks ?? 8}
                    className="w-full bg-transparent tabular-nums outline-none"
                  />
                  <span className="text-xs text-muted-foreground">weeks</span>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold">Lessons</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">The first lesson is a free preview for everyone.</p>
              </div>
              <span className="text-sm text-muted-foreground">
                {ready} {ready === 1 ? "video" : "videos"}
              </span>
            </div>

            {lessons.length > 0 && (
              <ol className="mt-4 divide-y divide-border/60 overflow-hidden rounded-xl border border-border">
                {lessons.map((lesson, i) => (
                  <li key={lesson.id} className="flex items-center gap-3 px-3 py-2.5">
                    <GripVertical className="size-4 shrink-0 text-muted-foreground/50" />
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-xs font-semibold text-primary">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <input
                        value={lesson.title}
                        onChange={(e) => setLessons((ls) => ls.map((l) => (l.id === lesson.id ? { ...l, title: e.target.value } : l)))}
                        aria-label={`Lesson ${i + 1} title`}
                        className="w-full truncate rounded bg-transparent text-sm font-medium outline-none focus:bg-foreground/5"
                      />
                      {lesson.progress !== null ? (
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="flex-1">
                            <ProgressBar value={lesson.progress} />
                          </div>
                          <span className="w-9 text-right text-[11px] tabular-nums text-muted-foreground">{lesson.progress}%</span>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">{lesson.durationMin} min · Private video</p>
                      )}
                    </div>
                    {i === 0 && (
                      <span className="hidden sm:block">
                        <StatusPill tone="green">Free preview</StatusPill>
                      </span>
                    )}
                    <div className="flex">
                      <Button type="button" variant="ghost" size="icon-sm" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">
                        <ArrowUp />
                      </Button>
                      <Button type="button" variant="ghost" size="icon-sm" disabled={i === lessons.length - 1} onClick={() => move(i, 1)} aria-label="Move down">
                        <ArrowDown />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Delete lesson ${i + 1}`}
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => {
                          setLessons((ls) => ls.filter((l) => l.id !== lesson.id));
                          toast.success("Lesson deleted");
                        }}
                      >
                        <Trash />
                      </Button>
                    </div>
                  </li>
                ))}
              </ol>
            )}

            <label
              data-dragging={dragging}
              className={cn(dropzoneClass, "mt-4 flex-col items-center justify-center gap-2 px-4 py-10 text-center")}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                addVideos(e.dataTransfer.files);
              }}
            >
              <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
                <CloudUpload className="size-5" />
              </span>
              <span className="text-sm font-medium">Drop a video here or click to upload</span>
              <span className="text-xs text-muted-foreground">MP4 · up to 200 MB · stored privately</span>
              <input
                type="file"
                accept="video/mp4"
                multiple
                className="sr-only"
                onChange={(e) => {
                  addVideos(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
          </section>
        </div>

        <div className="space-y-5 lg:sticky lg:top-8">
          <section className="space-y-3 rounded-2xl border border-border bg-card p-5">
            <h2 className="font-semibold">Cover image</h2>
            <Uploader kind="image" cta="Upload cover" hint="16:9 · JPG or PNG · optimized automatically" defaultPreview={program?.image} />
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-semibold">Visibility</h2>
            <div className="mt-3 flex items-center justify-between gap-4">
              <div>
                <Label htmlFor="published" className="font-medium">
                  Published
                </Label>
                <p className="mt-0.5 text-xs text-muted-foreground">Visible on your profile and the directory</p>
              </div>
              <Switch
                id="published"
                checked={published}
                onCheckedChange={(on) => {
                  if (on && ready === 0) return toast.error("Upload at least one lesson before publishing.");
                  setPublished(on);
                  if (!isNew) toast.success(on ? "Your program is live" : "Program unpublished");
                }}
              />
            </div>
          </section>
        </div>
      </div>
    </form>
  );
}
