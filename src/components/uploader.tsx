"use client";

import { useState } from "react";
import { upload } from "@imagekit/next";
import { CheckCircle2, ImageUp, Loader2 } from "lucide-react";
import { toast } from "sonner";

const LIMITS = {
  image: { types: ["image/jpeg", "image/png", "image/webp"], maxBytes: 5 * 1024 * 1024, label: "JPG, PNG or WebP · max 5 MB" },
  video: { types: ["video/mp4"], maxBytes: 200 * 1024 * 1024, label: "MP4 · max 200 MB" },
} as const;

/**
 * Uploads straight from the browser to ImageKit using short-lived signed params
 * from /api/upload-auth. Writes the result into hidden inputs for the form:
 * images -> public URL, videos -> private file path (+ `${name}Duration`).
 */
export function Uploader({
  name,
  kind,
  folder,
  label,
  defaultValue,
}: {
  name: string;
  kind: "image" | "video";
  folder: string;
  label: string;
  defaultValue?: string | null;
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [duration, setDuration] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const limits = LIMITS[kind];

  async function handleFile(file: File) {
    if (!(limits.types as readonly string[]).includes(file.type)) return toast.error(`Wrong file type. ${limits.label}.`);
    if (file.size > limits.maxBytes) return toast.error(`File too large. ${limits.label}.`);

    setProgress(0);
    try {
      const authRes = await fetch("/api/upload-auth", { cache: "no-store" });
      if (!authRes.ok) throw new Error("Could not authorize upload");
      const auth = await authRes.json();

      const res = await upload({
        file,
        fileName: file.name,
        folder,
        isPrivateFile: kind === "video", // lesson videos are only served via signed URLs
        ...auth,
        onProgress: (e) => setProgress(Math.round((e.loaded / e.total) * 100)),
      });
      setValue((kind === "video" ? res.filePath : res.url) ?? "");
      setDuration(res.duration ? String(Math.round(res.duration)) : "");
      toast.success("Upload complete");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setProgress(null);
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <input type="hidden" name={name} value={value} />
      {kind === "video" && <input type="hidden" name={`${name}Duration`} value={duration} />}

      <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed p-4 text-sm transition hover:border-primary/50">
        {kind === "image" && value ? (
          // eslint-disable-next-line @next/next/no-img-element -- tiny preview of a just-uploaded file
          <img src={value} alt="" className="size-14 rounded-lg object-cover" />
        ) : (
          <span className="grid size-14 place-items-center rounded-lg bg-muted text-primary">
            {progress !== null ? <Loader2 className="animate-spin" /> : value ? <CheckCircle2 /> : <ImageUp />}
          </span>
        )}
        <span className="flex-1">
          <span className="block font-medium">
            {progress !== null ? `Uploading… ${progress}%` : value ? "Uploaded. Click to replace" : `Choose ${kind}`}
          </span>
          <span className="text-muted-foreground">{limits.label}</span>
        </span>
        <input
          type="file"
          accept={limits.types.join(",")}
          className="sr-only"
          disabled={progress !== null}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </label>
      {progress !== null && (
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}
