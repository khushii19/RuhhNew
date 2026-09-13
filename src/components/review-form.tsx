"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

export function ReviewForm({ ownerName }: { ownerName: string }) {
  const params = useSearchParams();
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");
  const [ref, setRef] = useState(params.get("ref") ?? "");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (name.trim().length < 2) return setError("Please enter your name.");
    if (body.trim().length < 10) return setError("Please write a few words about your experience.");
    setBusy(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), rating, body: body.trim(), orderRef: ref.trim() || undefined, website }),
      });
      const json = (await res.json()) as { error?: string };
      if (!res.ok) return setError(json.error ?? "Something went wrong.");
      setDone(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return <div className="rounded-[12px] bg-sage/50 p-4 text-center text-[13px] text-sage-deep">Thank you! Your review will appear once {ownerName} has approved it.</div>;
  }

  return (
    <form onSubmit={submit} className="card p-4">
      <label className="label">Your name</label>
      <input className="field mb-3" value={name} onChange={(e) => setName(e.target.value)} />
      <label className="label">Rating</label>
      <div className="mb-3 flex gap-1" role="radiogroup" aria-label="Rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={rating === n}
            aria-label={`${n} stars`}
            onClick={() => setRating(n)}
            className={`text-[26px] leading-none ${n <= rating ? "text-peach-mid" : "text-line"}`}
          >
            ★
          </button>
        ))}
      </div>
      <label className="label">Your review</label>
      <textarea className="field mb-3 min-h-[90px]" value={body} onChange={(e) => setBody(e.target.value)} placeholder="What did you order? How was it?" />
      <label className="label">Order reference (optional)</label>
      <input className="field mb-3" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="RUH-1042" />
      <div className="absolute -left-[9999px] top-0" aria-hidden="true">
        <label>
          Website <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </label>
      </div>
      {error && <p className="mb-2 text-[12px] text-danger">{error}</p>}
      <button className="btn-p w-full rounded-[10px]" disabled={busy}>
        {busy ? "Sending…" : "Submit review"}
      </button>
    </form>
  );
}
