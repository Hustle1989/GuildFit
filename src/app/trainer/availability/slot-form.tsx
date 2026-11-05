"use client";

import { useState } from "react";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSlot } from "./actions";

/** The datetime input is in the trainer's local time; we send UTC ISO to the server. */
export function SlotForm() {
  const [local, setLocal] = useState("");
  const iso = local ? new Date(local).toISOString() : "";

  return (
    <ActionForm action={createSlot} successMessage="Slot added" className="grid gap-4 rounded-2xl border p-5 sm:grid-cols-4 sm:items-end">
      <div className="space-y-1.5 sm:col-span-2">
        <Label htmlFor="startsAtLocal">Start time</Label>
        <Input id="startsAtLocal" type="datetime-local" value={local} onChange={(e) => setLocal(e.target.value)} required />
        <input type="hidden" name="startsAt" value={iso} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="durationMin">Length</Label>
        <select id="durationMin" name="durationMin" defaultValue="60" className="h-9 w-full rounded-lg border border-input bg-transparent px-3 text-sm">
          <option value="30">30 min</option>
          <option value="45">45 min</option>
          <option value="60">60 min</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="priceNaira">Price (₦)</Label>
        <Input id="priceNaira" name="priceNaira" type="number" min={1000} step={500} defaultValue={10000} required />
      </div>
      <SubmitButton className="sm:col-span-4 sm:justify-self-start">Add slot</SubmitButton>
    </ActionForm>
  );
}
