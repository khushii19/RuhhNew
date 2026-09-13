import { adminClient } from "@/lib/supabase/admin";
import type { Special } from "@/lib/types";
import { deleteSpecial, saveSpecial } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/confirm-button";

function SpecialForm({ s }: { s?: Special }) {
  return (
    <form action={saveSpecial} className="card p-3">
      {s && <input type="hidden" name="id" value={s.id} />}
      <div className="grid gap-2 sm:grid-cols-[60px_1fr_1fr]">
        <div>
          <label className="label">Icon</label>
          <input name="emoji" defaultValue={s?.emoji ?? "✨"} maxLength={4} className="admin-input text-center" />
        </div>
        <div>
          <label className="label">Name</label>
          <input name="name" defaultValue={s?.name ?? ""} required className="admin-input" />
        </div>
        <div>
          <label className="label">Badge text</label>
          <input name="tag" defaultValue={s?.tag ?? ""} placeholder="e.g. Limited" className="admin-input" />
        </div>
      </div>
      <div className="mt-2">
        <label className="label">Description</label>
        <textarea name="description" defaultValue={s?.description ?? ""} className="admin-input min-h-[50px]" />
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-4">
        <div>
          <label className="label">Price AED</label>
          <input name="price_aed" type="number" min={0} step="0.5" defaultValue={s?.price_aed ?? 0} className="admin-input" />
        </div>
        <div>
          <label className="label">Was AED</label>
          <input name="old_price_aed" type="number" min={0} step="0.5" defaultValue={s?.old_price_aed ?? ""} className="admin-input" />
        </div>
        <div>
          <label className="label">Accent</label>
          <select name="accent" defaultValue={s?.accent ?? "rose"} className="admin-input">
            <option value="rose">Rose</option>
            <option value="lav">Lavender</option>
            <option value="sage">Sage</option>
            <option value="peach">Peach</option>
          </select>
        </div>
        <div>
          <label className="label">Order</label>
          <input name="sort_order" type="number" defaultValue={s?.sort_order ?? 1} className="admin-input" />
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <label className="flex items-center gap-2 text-[13px]">
          <input type="checkbox" name="is_active" defaultChecked={s ? s.is_active : true} className="accent-rose-deep" /> Show on home page
        </label>
        <button className="btn-p px-4 py-1.5 text-[12px]">{s ? "Save" : "Add special"}</button>
      </div>
    </form>
  );
}

export default async function SpecialsPage() {
  const { data } = await adminClient().from("specials").select("*").order("sort_order");
  const specials = ((data ?? []) as Special[]).map((s) => ({ ...s, price_aed: Number(s.price_aed), old_price_aed: s.old_price_aed == null ? null : Number(s.old_price_aed) }));
  return (
    <>
      <h1 className="mb-1 text-[18px] font-bold">Weekly specials</h1>
      <p className="mb-4 text-[12px] text-muted">Cards shown at the top of the home page. Customers can add them to the cart at the special price.</p>
      <div className="grid gap-3">
        {specials.map((s) => (
          <div key={s.id}>
            <SpecialForm s={s} />
            <ConfirmButton action={deleteSpecial} hidden={{ id: s.id }} message={`Delete "${s.name}"?`} className="mt-1 text-[11px] text-muted hover:text-danger">
              Delete
            </ConfirmButton>
          </div>
        ))}
      </div>
      <h2 className="sec-head mt-6">New special</h2>
      <SpecialForm />
    </>
  );
}
