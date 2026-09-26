import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

/** env reads process.env at module load, so each case needs a fresh import. */
async function configuredWith(url?: string, key?: string) {
  vi.resetModules();
  if (url === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  else process.env.NEXT_PUBLIC_SUPABASE_URL = url;
  if (key === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  else process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = key;
  const { isSupabaseConfigured } = await import("@/lib/env");
  return isSupabaseConfigured();
}

describe("isSupabaseConfigured", () => {
  const original = { ...process.env };
  beforeEach(() => vi.spyOn(console, "warn").mockImplementation(() => {}));
  afterEach(() => {
    process.env = { ...original };
    vi.restoreAllMocks();
  });

  it("accepts a usable https url with a key", async () => {
    expect(await configuredWith("https://abc.supabase.co", "eyJkey")).toBe(true);
  });

  it("rejects a url missing its scheme, rather than letting createClient throw", async () => {
    expect(await configuredWith("abc.supabase.co", "eyJkey")).toBe(false);
  });

  it("rejects a non-http scheme", async () => {
    expect(await configuredWith("ftp://abc.supabase.co", "eyJkey")).toBe(false);
  });

  it("rejects missing values", async () => {
    expect(await configuredWith(undefined, "eyJkey")).toBe(false);
    expect(await configuredWith("https://abc.supabase.co", undefined)).toBe(false);
  });
});

describe("env.siteUrl", () => {
  const original = { ...process.env };
  afterEach(() => {
    process.env = { ...original };
  });

  async function siteUrlWith(site?: string, vercel?: string) {
    vi.resetModules();
    if (site === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = site;
    if (vercel === undefined) delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
    else process.env.VERCEL_PROJECT_PRODUCTION_URL = vercel;
    const { env } = await import("@/lib/env");
    return env.siteUrl;
  }

  it("prefers the explicit setting", async () => {
    expect(await siteUrlWith("https://ruhh.ae", "ruhh-new.vercel.app")).toBe("https://ruhh.ae");
  });

  it("falls back to Vercel's production domain", async () => {
    expect(await siteUrlWith(undefined, "ruhh-new.vercel.app")).toBe("https://ruhh-new.vercel.app");
  });

  it("treats an empty setting as unset", async () => {
    expect(await siteUrlWith("", "ruhh-new.vercel.app")).toBe("https://ruhh-new.vercel.app");
  });

  it("uses localhost outside Vercel", async () => {
    expect(await siteUrlWith(undefined, undefined)).toBe("http://localhost:3000");
  });
});
