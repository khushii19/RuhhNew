import { adminClient } from "@/lib/supabase/admin";
import type { Special } from "@/lib/types";
import { deleteSpecial, removeSpecialPhoto, saveSpecial, uploadSpecialPhoto } from "@/app/admin/actions";
import { Photo } from "@/components/photo";
import { ACCENT } from "@/components/special-card";
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
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <div>
          <label className="label">Show from (optional)</label>
          <input name="starts_on" type="date" defaultValue={s?.starts_on ?? ""} className="admin-input" />
        </div>
        <div>
          <label className="label">Show until (optional)</label>
          <input name="ends_on" type="date" defaultValue={s?.ends_on ?? ""} className="admin-input" />
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

/** Photo upload plus a small preview in the special's accent colour. */
function SpecialPhoto({ s }: { s: Special }) {
  const a = ACCENT[s.accent] ?? ACCENT.rose;
  return (
    <div className="card h-fit p-3">
      <div className="label">Photo</div>
      <div className={`relative mb-2 flex h-[120px] items-center justify-center overflow-hidden rounded-[10px] border-[1.5px] border-dashed text-[40px] ${a.bg} ${a.border}`}>
        {s.image_url ? <Photo src={s.image_url} alt={s.name} fill sizes="220px" className="object-cover" /> : s.emoji}
      </div>
      <form action={uploadSpecialPhoto} className="grid gap-1.5">
        <input type="hidden" name="id" value={s.id} />
        <input type="file" name="photo" accept="image/*" required className="text-[11px]" />
        <button className="btn-o py-1 text-[12px]">Upload photo</button>
      </form>
      {s.image_url && (
        <form action={removeSpecialPhoto} className="mt-1.5">
          <input type="hidden" name="id" value={s.id} />
          <button className="w-full text-[11px] text-muted hover:text-danger">Remove photo</button>
        </form>
      )}
    </div>
  );
}

export default async function SpecialsPage() {
  const { data } = await adminClient().from("specials").select("*").order("sort_order");
  const specials = ((data ?? []) as Special[]).map((s) => ({ ...s, price_aed: Number(s.price_aed), old_price_aed: s.old_price_aed == null ? null : Number(s.old_price_aed) }));
  return (
    <>
      <h1 className="mb-1 text-[18px] font-bold">Weekly specials</h1>
      <p className="mb-4 text-[12px] text-muted">Cards shown on the home page and in the &ldquo;This week&rsquo;s special&rdquo; sheet. Leave the dates blank to show a special until you untick it.</p>
      <div className="grid gap-3">
        {specials.map((s) => (
          <div key={s.id}>
            <div className="grid gap-3 md:grid-cols-[1fr_220px]">
              <SpecialForm s={s} />
              <SpecialPhoto s={s} />
            </div>
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
