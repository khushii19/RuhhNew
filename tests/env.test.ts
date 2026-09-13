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
