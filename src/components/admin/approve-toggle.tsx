"use client";

import { useTransition } from "react";
import { setReviewApproval } from "@/app/admin/actions";

export function ApproveToggle({ id, approved }: { id: string; approved: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => start(() => setReviewApproval(id, !approved))}
      className={`rounded-full px-3 py-1 text-[12px] ${approved ? "border border-line text-muted hover:text-danger" : "bg-sage-deep text-on-accent"} disabled:opacity-50`}
    >
      {approved ? "Unpublish" : "Approve"}
    </button>
  );
}
