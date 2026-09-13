import type { Metadata } from "next";
import { Suspense } from "react";
import { getApprovedReviews, getSettings } from "@/lib/data";
import { ReviewForm } from "@/components/review-form";
import { Stars } from "@/components/stars";
import { fmtDate } from "@/lib/format";

export const revalidate = 60;
export const metadata: Metadata = { title: "Reviews" };

export default async function ReviewsPage() {
  const [reviews, settings] = await Promise.all([getApprovedReviews(50), getSettings()]);
  const avg = reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;
  return (
    <>
      <h2 className="sec-head">Reviews</h2>
      {reviews.length > 0 && (
        <div className="mb-4 flex items-center gap-3 rounded-[12px] bg-cream2 p-4">
          <div className="text-[28px] font-bold text-rose-deep">{avg.toFixed(1)}</div>
          <div>
            <Stars n={Math.round(avg)} />
            <div className="text-[11px] text-muted">
              from {reviews.length} review{reviews.length === 1 ? "" : "s"}
            </div>
          </div>
        </div>
      )}
      <div className="mb-6 grid gap-2.5">
        {reviews.length === 0 && <p className="text-[12px] text-muted">No reviews yet. Be the first.</p>}
        {reviews.map((r) => (
          <div key={r.id} className="card p-4">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[13px] font-bold">{r.customer_name}</span>
              <Stars n={r.rating} />
            </div>
            <p className="text-[12px] leading-[1.6] text-muted">{r.body}</p>
            <div className="mt-1 text-[10px] text-muted/70">{fmtDate(r.created_at, { day: "numeric", month: "short", year: "numeric" })}</div>
          </div>
        ))}
      </div>
      <h2 className="sec-head">Leave a review</h2>
      <Suspense fallback={<div className="card p-4 text-[12px] text-muted">Loading…</div>}>
        <ReviewForm ownerName={settings.owner_name} />
      </Suspense>
    </>
  );
}
