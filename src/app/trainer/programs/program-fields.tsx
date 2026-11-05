"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Uploader } from "@/components/uploader";

export function ProgramFields({
  defaults = {},
}: {
  defaults?: { title?: string; description?: string; level?: string; coverUrl?: string | null };
}) {
  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" defaultValue={defaults.title} placeholder="12-Week Strength Foundations" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" defaultValue={defaults.description} rows={5} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="level">Level</Label>
        <select
          id="level"
          name="level"
          defaultValue={defaults.level ?? "beginner"}
          className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm capitalize"
        >
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>
      <Uploader name="coverUrl" kind="image" folder="/guildfit/programs" label="Cover image" defaultValue={defaults.coverUrl} />
    </div>
  );
}
