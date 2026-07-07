import type { MetadataRoute } from "next";
import { tools } from "@/lib/tools";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const lastModified = new Date("2026-07-07");

  return [
    {
      url: baseUrl,
      lastModified
    },
    {
      url: `${baseUrl}/about`,
      lastModified
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified
    },
    ...tools.map((tool) => ({
      url: `${baseUrl}/tools/${tool.slug}`,
      lastModified
    }))
  ];
}
