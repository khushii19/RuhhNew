import { adminClient } from "@/lib/supabase/admin";
import { env } from "@/lib/env";
import { requireAdmin } from "@/lib/auth";
import { fmtDate } from "@/lib/format";
import type { AdminUser } from "@/lib/types";
import { addAdmin, removeAdmin } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/confirm-button";

export default async function AdminsPage() {
  const session = await requireAdmin();
  const { data } = await adminClient().from("admin_users").select("*").order("created_at");
  const admins = (data ?? []) as AdminUser[];
  return (
    <>
      <h1 className="mb-1 text-[18px] font-bold">Admins</h1>
      <p className="mb-4 text-[12px] text-muted">Anyone listed here can sign in to this panel with a magic link sent to their email.</p>
      <div className="grid gap-2">
        {admins.map((a) => (
          <div key={a.id} className="card flex items-center justify-between gap-2 p-3">
            <div>
              <div className="text-[13px] font-bold">
                {a.name ?? a.email} {a.email === session.email && <span className="tag bg-sage text-sage-deep">you</span>}
              </div>
              <div className="text-[12px] text-muted">
                {a.email} · added {fmtDate(a.created_at, { day: "numeric", month: "short", year: "numeric" })}
                {a.added_by ? ` by ${a.added_by}` : ""}
              </div>
            </div>
            {a.email !== session.email && (
              <ConfirmButton action={removeAdmin} hidden={{ email: a.email }} message={`Remove ${a.email} as admin?`} className="text-[12px] text-muted hover:text-danger">
                Remove
              </ConfirmButton>
            )}
          </div>
        ))}
        {env.adminEmails.map((e) => (
          <div key={e} className="card flex items-center justify-between gap-2 p-3 opacity-80">
            <div>
              <div className="text-[13px] font-bold">{e}</div>
              <div className="text-[12px] text-muted">Configured in the ADMIN_EMAILS environment variable</div>
            </div>
          </div>
        ))}
      </div>
      <form action={addAdmin} className="card mt-4 grid gap-1.5 p-3 sm:grid-cols-[1fr_1fr_auto]">
        <input name="email" type="email" required placeholder="email@example.com" className="admin-input" />
        <input name="name" placeholder="Name (optional)" className="admin-input" />
        <button className="btn-p px-4 py-1.5 text-[12px]">Add admin</button>
      </form>
    </>
  );
}
