import { createClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Anonymous client for storefront reads (menu, specials, settings).
 * Row-level security restricts it to public data only.
 */
export function publicClient() {
  return createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
