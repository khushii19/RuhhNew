import { adminClient } from "@/lib/supabase/admin";
import { fmtDateTime } from "@/lib/format";
import type { Review } from "@/lib/types";
import { Stars } from "@/components/stars";
import { ApproveToggle } from "@/components/admin/approve-toggle";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { deleteReview } from "@/app/admin/actions";

export default async function ReviewsPage() {
  const { data } = await adminClient().from("reviews").select("*").order("is_approved").order("created_at", { ascending: false }).limit(300);
  const list = (data ?? []) as Review[];
  return (
    <>
      <h1 className="mb-1 text-[18px] font-bold">Reviews</h1>
      <p className="mb-4 text-[12px] text-muted">New reviews are hidden until you approve them.</p>
      {list.length === 0 && <div className="card p-8 text-center text-[13px] text-muted">No reviews yet.</div>}
      <div className="grid gap-2">
        {list.map((r) => (
          <div key={r.id} className={`card p-3.5 ${r.is_approved ? "" : "border-peach-mid"}`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold">{r.customer_name}</span>
                <Stars n={r.rating} />
                {r.order_ref && <span className="tag bg-cream2 text-muted">{r.order_ref}</span>}
                {!r.is_approved && <span className="tag bg-peach text-peach-deep">pending</span>}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-muted">{fmtDateTime(r.created_at)}</span>
                <ApproveToggle id={r.id} approved={r.is_approved} />
                <ConfirmButton action={deleteReview} hidden={{ id: r.id }} message="Delete this review?" className="text-[16px] text-muted hover:text-danger">
                  ×
                </ConfirmButton>
              </div>
            </div>
            <p className="mt-1.5 text-[13px] text-muted">{r.body}</p>
          </div>
        ))}
      </div>
    </>
  );
}
