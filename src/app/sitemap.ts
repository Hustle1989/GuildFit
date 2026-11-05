import type { MetadataRoute } from "next";
import { listPrograms, listTrainers } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const [trainers, programs] = await Promise.all([listTrainers(), listPrograms()]);
  return [
    { url: base },
    { url: `${base}/trainers` },
    { url: `${base}/programs` },
    { url: `${base}/pricing` },
    ...trainers.map((t) => ({ url: `${base}/trainers/${t.slug}` })),
    ...programs.map((p) => ({ url: `${base}/programs/${p.slug}` })),
  ];
}
