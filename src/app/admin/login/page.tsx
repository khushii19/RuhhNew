import { redirect } from "next/navigation";
import { Monogram } from "@/components/brand-logo";
import { getAdminSession } from "@/lib/auth";
import { sendMagicLink } from "@/app/admin/actions";

export const metadata = { title: "Admin login", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  const session = await getAdminSession();
  if (session) redirect("/admin");
  const sp = await searchParams;
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream p-5">
      <div className="card w-full max-w-[380px] p-7">
        <div className="mb-5 flex items-center gap-3">
          <Monogram size={44} />
          <div>
            <div className="text-[16px] font-bold text-rose-deep">Ruhh — Admin</div>
            <div className="text-[11px] text-muted">Sign in with a magic link</div>
          </div>
        </div>
        {sp.sent ? (
          <p className="rounded-[10px] bg-sage/50 p-3 text-[13px] text-sage-deep">
            If <b>{sp.sent}</b> is an admin, a sign-in link is on its way. Open it on this device.
          </p>
        ) : (
          <form action={sendMagicLink}>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input id="email" name="email" type="email" required autoComplete="email" className="field mb-3" placeholder="you@example.com" />
            {sp.error === "link" && <p className="mb-2 text-[12px] text-danger">That link is invalid or expired. Request a new one.</p>}
            {sp.error === "config" && <p className="mb-2 text-[12px] text-danger">Supabase is not configured yet. Set the environment variables described in the README.</p>}
            {sp.error === "denied" && <p className="mb-2 text-[12px] text-danger">That email is not an admin.</p>}
            <button className="btn-p w-full rounded-[10px]">Send me a sign-in link</button>
          </form>
        )}
      </div>
    </div>
  );
}
