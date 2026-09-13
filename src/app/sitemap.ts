import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.siteUrl.replace(/\/$/, "");
  return ["/", "/menu", "/order", "/track", "/custom-cakes", "/reviews", "/privacy", "/terms"].map((p) => ({
    url: `${base}${p}`,
    changeFrequency: p === "/" || p === "/menu" ? "weekly" : "monthly",
    priority: p === "/" ? 1 : p === "/menu" ? 0.9 : 0.5,
  }));
}
