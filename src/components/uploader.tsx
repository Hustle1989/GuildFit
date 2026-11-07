"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { CircleCheck, Film, ImagePlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const LIMITS = {
  image: { accept: "image/jpeg,image/png,image/webp", maxBytes: 5 * 1024 * 1024, hint: "JPG, PNG or WebP · max 5 MB" },
  video: { accept: "video/mp4", maxBytes: 200 * 1024 * 1024, hint: "MP4 · up to 200 MB · stored privately" },
} as const;

/** Shared dashed drop-zone look (cover image, lesson videos). */
export const dropzoneClass =
  "group relative flex cursor-pointer overflow-hidden rounded-xl border border-dashed border-foreground/15 bg-foreground/[0.02] transition hover:border-primary/70 hover:bg-primary/[0.04] data-[dragging=true]:border-primary data-[dragging=true]:bg-primary/[0.06]";

/**
 * UI-only uploader: previews the chosen file locally and fakes the upload
 * progress. Later this uploads straight to ImageKit.
 */
export function Uploader({
  kind,
  label,
  cta,
  hint,
  defaultPreview,
  aspect = "aspect-video",
  compact,
}: {
  kind: "image" | "video";
  label?: string;
  cta?: string;
  hint?: string;
  defaultPreview?: string;
  aspect?: string;
  compact?: boolean;
}) {
  const limits = LIMITS[kind];
  const [preview, setPreview] = useState(defaultPreview ?? "");
  const [fileName, setFileName] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
  }, []);

  function handle(file: File) {
    if (file.size > limits.maxBytes) return toast.error(`File too large. ${limits.hint}`);
    setFileName(file.name);
    if (kind === "image") setPreview(URL.createObjectURL(file));
    let value = 0;
    setProgress(0);
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      value += kind === "video" ? 7 : 20;
      if (value < 100) return setProgress(value);
      if (timer.current) clearInterval(timer.current);
      setProgress(null);
      toast.success("Upload complete");
    }, 180);
  }

  const done = progress === null && (fileName || preview);
  const dropProps = {
    "data-dragging": dragging,
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(true);
    },
    onDragLeave: () => setDragging(false),
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handle(file);
    },
  };
  const input = (
    <input type="file" accept={limits.accept} className="sr-only" disabled={progress !== null} onChange={(e) => e.target.files?.[0] && handle(e.target.files[0])} />
  );

  if (compact) {
    return (
      <div className="space-y-2">
        {label && <p className="text-sm font-medium">{label}</p>}
        <label className={cn(dropzoneClass, "items-center gap-4 p-3")} {...dropProps}>
          <span className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-full border border-primary/25 bg-primary/10 text-primary">
            {kind === "image" && preview ? (
              <Image src={preview} alt="" fill unoptimized className="object-cover" />
            ) : progress !== null ? (
              <Loader2 className="animate-spin" />
            ) : done ? (
              <CircleCheck />
            ) : kind === "video" ? (
              <Film />
            ) : (
              <ImagePlus />
            )}
          </span>
          <span>
            <span className="block text-sm font-medium">
              {progress !== null ? `Uploading… ${progress}%` : fileName || (preview ? "Click to replace" : cta ?? `Upload ${kind}`)}
            </span>
            <span className="text-xs text-muted-foreground">{hint ?? limits.hint}</span>
          </span>
          {input}
        </label>
        {progress !== null && <ProgressBar value={progress} />}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {label && <p className="text-sm font-medium">{label}</p>}
      <label className={cn(dropzoneClass, "flex-col items-center justify-center text-center", aspect)} {...dropProps}>
        {kind === "image" && preview && (
          <Image src={preview} alt="" fill unoptimized className="object-cover transition group-hover:scale-[1.02] group-hover:opacity-60" />
        )}
        <span
          className={cn(
            "relative flex flex-col items-center gap-2 px-4",
            preview && kind === "image" && "rounded-lg bg-black/60 px-3 py-2 text-white opacity-0 transition group-hover:opacity-100",
            preview && kind === "image" && progress !== null && "opacity-100",
          )}
        >
          {!(preview && kind === "image") && (
            <span className="grid size-10 place-items-center rounded-full bg-primary/10 text-primary">
              {progress !== null ? <Loader2 className="size-5 animate-spin" /> : kind === "video" ? <Film className="size-5" /> : <ImagePlus className="size-5" />}
            </span>
          )}
          <span className="text-sm font-medium">
            {progress !== null ? `Uploading… ${progress}%` : preview ? "Replace image" : cta ?? `Upload ${kind}`}
          </span>
        </span>
        {input}
      </label>
      {progress !== null && <ProgressBar value={progress} />}
      <p className="text-xs text-muted-foreground">{hint ?? limits.hint}</p>
    </div>
  );
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-primary/15" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100}>
      <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${value}%` }} />
    </div>
  );
}
