import Link from "next/link";
import { eq } from "drizzle-orm";
import { ActionForm } from "@/components/action-form";
import { SubmitButton } from "@/components/submit-button";
import { TrainerProfileFields } from "@/components/trainer-profile-fields";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Uploader } from "@/components/uploader";
import { db, trainerProfiles } from "@/db";
import { requireTrainer } from "@/lib/session";
import { updateTrainerProfile } from "./actions";

export default async function TrainerProfilePage() {
  const user = await requireTrainer();
  const [profile] = await db.select().from(trainerProfiles).where(eq(trainerProfiles.userId, user.id));

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Public profile</h1>
        {profile && (
          <Link href={`/trainers/${profile.slug}`} className="text-sm text-primary hover:underline">View public page</Link>
        )}
      </div>
      <ActionForm action={updateTrainerProfile} successMessage="Profile saved" className="space-y-6">
        <div className="space-y-1.5">
          <Label htmlFor="name">Display name</Label>
          <Input id="name" name="name" defaultValue={user.name} required />
        </div>
        <Uploader name="avatarUrl" kind="image" folder="/guildfit/avatars" label="Profile photo" defaultValue={user.image} />
        <TrainerProfileFields defaults={profile} />
        <SubmitButton size="lg">Save profile</SubmitButton>
      </ActionForm>
    </div>
  );
}
