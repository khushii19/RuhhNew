import { redirect } from "next/navigation";
import { env, isSupabaseConfigured } from "@/lib/env";
import { adminClient } from "@/lib/supabase/admin";
import { serverClient } from "@/lib/supabase/server";

export interface AdminSession {
  email: string;
  name: string | null;
}

export async function isAdminEmail(email: string | null | undefined): Promise<boolean> {
  if (!email) return false;
  const e = email.toLowerCase();
  if (env.adminEmails.includes(e)) return true;
  const { data } = await adminClient().from("admin_users").select("id").eq("email", e).maybeSingle();
  return Boolean(data);
}

export async function getAdminSession(): Promise<AdminSession | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await serverClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user?.email) return null;
  if (!(await isAdminEmail(user.email))) return null;
  return { email: user.email.toLowerCase(), name: (user.user_metadata?.name as string | undefined) ?? null };
}

/** Use at the top of every admin page and server action. */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}
