import { adminClient } from "@/lib/supabase/admin";
import { fmtDate, fmtDateTime } from "@/lib/format";
import type { Enquiry } from "@/lib/types";
import { updateEnquiry } from "@/app/admin/actions";

export default async function EnquiriesPage() {
  const { data } = await adminClient().from("enquiries").select("*").order("created_at", { ascending: false }).limit(200);
  const list = (data ?? []) as Enquiry[];
  return (
    <>
      <h1 className="mb-4 text-[18px] font-bold">Custom cake enquiries</h1>
      {list.length === 0 && <div className="card p-8 text-center text-[13px] text-muted">No enquiries yet.</div>}
      <div className="grid gap-3">
        {list.map((e) => (
          <div key={e.id} className="card p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="text-[14px] font-bold">
                  {e.name} <span className={`tag ml-1 ${e.status === "new" ? "bg-peach text-peach-deep" : e.status === "closed" ? "bg-cream2 text-muted" : "bg-sage text-sage-deep"}`}>{e.status}</span>
                </div>
                <a className="text-[12px] text-lav-deep" href={`https://wa.me/${e.phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer">
                  {e.phone}
                </a>
                <div className="text-[12px] text-muted">
                  {e.occasion ?? "—"} · {e.event_date ? fmtDate(e.event_date) : "date flexible"} · {e.servings ?? "servings —"} · {e.budget_aed ? `AED ${Number(e.budget_aed)}` : "budget —"}
                </div>
              </div>
              <div className="text-[11px] text-muted">{fmtDateTime(e.created_at)}</div>
            </div>
            <p className="mt-2 whitespace-pre-wrap rounded-[8px] bg-cream2 p-2.5 text-[13px]">{e.description}</p>
            <form action={updateEnquiry} className="mt-2 grid gap-1.5 sm:grid-cols-[140px_1fr_auto]">
              <input type="hidden" name="id" value={e.id} />
              <select name="status" defaultValue={e.status} className="admin-input">
                <option value="new">New</option>
                <option value="quoted">Quoted</option>
                <option value="confirmed">Confirmed</option>
                <option value="closed">Closed</option>
              </select>
              <input name="admin_notes" defaultValue={e.admin_notes ?? ""} placeholder="Internal notes (quote, agreed price…)" className="admin-input" />
              <button className="btn-o px-3 py-1 text-[12px]">Save</button>
            </form>
          </div>
        ))}
      </div>
    </>
  );
}
