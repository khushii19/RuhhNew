import sharp from "sharp";
import { adminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";

export const MAX_UPLOAD = 8 * 1024 * 1024;

/** Resize to web size and re-encode as JPEG (or keep PNG for transparency, e.g. logos). */
export async function toWebImage(input: Buffer, opts: { maxDim?: number; keepAlpha?: boolean } = {}) {
  const { maxDim = 1400, keepAlpha = false } = opts;
  const img = sharp(input, { failOn: "none" }).rotate().resize({ width: maxDim, height: maxDim, fit: "inside", withoutEnlargement: true });
  const meta = await sharp(input).metadata();
  if (keepAlpha && meta.hasAlpha) return { buffer: await img.png({ compressionLevel: 9 }).toBuffer(), contentType: "image/png", ext: "png" };
  return { buffer: await img.jpeg({ quality: 82, mozjpeg: true }).toBuffer(), contentType: "image/jpeg", ext: "jpg" };
}

export async function storeImage(buffer: Buffer, contentType: string, ext: string, folder: string): Promise<string> {
  const db = adminClient();
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await db.storage.from("media").upload(path, buffer, { contentType, upsert: false, cacheControl: "31536000" });
  if (error) throw new Error(error.message);
  return db.storage.from("media").getPublicUrl(path).data.publicUrl;
}

export function isInHouse(url: string | null | undefined) {
  return Boolean(url && env.supabaseUrl && url.startsWith(env.supabaseUrl));
}

/** Fetch an external image, resize it and store it in Supabase. */
export async function importExternalImage(url: string, folder: string, keepAlpha = false): Promise<string> {
  const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`Could not fetch image (${res.status})`);
  const raw = Buffer.from(await res.arrayBuffer());
  if (raw.length > 25 * 1024 * 1024) throw new Error("Image too large to import");
  const web = await toWebImage(raw, { keepAlpha });
  return storeImage(web.buffer, web.contentType, web.ext, folder);
}
