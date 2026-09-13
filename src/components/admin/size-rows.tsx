"use client";

import { useState } from "react";

interface Row {
  id?: string;
  label: string;
  piece_count: number;
  price_aed: number;
}

export function SizeRows({ initial }: { initial: Row[] }) {
  const [rows, setRows] = useState<Row[]>(initial.length ? initial : [{ label: "Standard", piece_count: 1, price_aed: 0 }]);
  const update = (i: number, patch: Partial<Row>) => setRows((r) => r.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  return (
    <div>
      <div className="grid grid-cols-[1fr_80px_100px_32px] gap-1.5 text-[10px] uppercase tracking-wider text-muted">
        <span>Label</span>
        <span>Pieces</span>
        <span>Price AED</span>
        <span />
      </div>
      {rows.map((r, i) => (
        <div key={r.id ?? `new-${i}`} className="mt-1.5 grid grid-cols-[1fr_80px_100px_32px] gap-1.5">
          <input type="hidden" name="size_id" value={r.id ?? ""} />
          <input name="size_label" value={r.label} onChange={(e) => update(i, { label: e.target.value })} placeholder="e.g. Box of 6" required className="admin-input" />
          <input name="size_count" type="number" min={1} value={r.piece_count} onChange={(e) => update(i, { piece_count: Number(e.target.value) })} className="admin-input" />
          <input name="size_price" type="number" min={0} step="0.5" value={r.price_aed} onChange={(e) => update(i, { price_aed: Number(e.target.value) })} className="admin-input" />
          <button type="button" aria-label="Remove size" onClick={() => setRows((rs) => rs.filter((_, idx) => idx !== i))} className="rounded-[8px] text-[16px] text-muted hover:bg-danger/10 hover:text-danger">
            ×
          </button>
        </div>
      ))}
      <button type="button" onClick={() => setRows((r) => [...r, { label: "", piece_count: 1, price_aed: 0 }])} className="mt-2 text-[12px] text-rose-deep hover:underline">
        + Add size
      </button>
    </div>
  );
}
