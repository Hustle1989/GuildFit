import type { MetadataRoute } from "next";
import { publishedPrograms, trainers } from "@/lib/mock-data";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return [
    { url: base },
    { url: `${base}/trainers` },
    { url: `${base}/programs` },
    { url: `${base}/pricing` },
    ...trainers.map((t) => ({ url: `${base}/trainers/${t.slug}` })),
    ...publishedPrograms.map((p) => ({ url: `${base}/programs/${p.slug}` })),
  ];
}
