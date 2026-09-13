import { Photo } from "@/components/photo";
import Link from "next/link";
import { notFound } from "next/navigation";
import { adminClient } from "@/lib/supabase/admin";
import { ITEM_SELECT } from "@/lib/data";
import type { Category, MenuItem } from "@/lib/types";
import { deleteMenuItem, removeItemPhoto, saveMenuItem, uploadItemPhoto } from "@/app/admin/actions";
import { SizeRows } from "@/components/admin/size-rows";
import { ConfirmButton } from "@/components/admin/confirm-button";

export default async function EditItemPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  const db = adminClient();
  const [{ data }, { data: cats }] = await Promise.all([
    db.from("menu_items").select(ITEM_SELECT).eq("id", id).maybeSingle(),
    db.from("categories").select("*").order("sort_order"),
  ]);
  if (!data) notFound();
  const m = data as MenuItem;
  const sizes = [...m.item_sizes].sort((a, b) => a.sort_order - b.sort_order);
  const flavours = [...m.item_flavours].sort((a, b) => a.sort_order - b.sort_order).map((f) => f.name);

  return (
    <>
      <Link href="/admin/menu" className="text-[12px] text-muted hover:text-rose-deep">
        ← Menu
      </Link>
      <h1 className="mt-2 mb-3 text-[18px] font-bold">{m.name}</h1>
      {sp.saved && <div className="mb-3 rounded-[10px] bg-sage/50 p-2.5 text-[12px] text-sage-deep">Saved. The menu updates for customers within a minute.</div>}

      <div className="grid gap-4 md:grid-cols-[1fr_260px]">
        <form action={saveMenuItem} className="card p-4">
          <input type="hidden" name="id" value={m.id} />
          <div className="grid gap-3 sm:grid-cols-[70px_1fr]">
            <div>
              <label className="label">Icon</label>
              <input name="emoji" defaultValue={m.emoji} maxLength={4} className="admin-input text-center text-[20px]" />
            </div>
            <div>
              <label className="label">Name</label>
              <input name="name" defaultValue={m.name} required className="admin-input" />
            </div>
          </div>
          <div className="mt-3">
            <label className="label">Short description</label>
            <input name="description" defaultValue={m.description} className="admin-input" />
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Category</label>
              <select name="category_id" defaultValue={m.category_id ?? ""} className="admin-input">
                <option value="">— none —</option>
                {(cats as Category[] | null)?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Sort order</label>
              <input name="sort_order" type="number" defaultValue={m.sort_order} className="admin-input" />
            </div>
          </div>

          <div className="mt-4">
            <label className="label">Flavours (comma-separated, blank for none)</label>
            <input name="flavours" defaultValue={flavours.join(", ")} placeholder="e.g. Vanilla, Chocolate, Lemon" className="admin-input" />
            <label className="mt-2 flex items-center gap-2 text-[13px]">
              <input type="checkbox" name="mixable" defaultChecked={m.mixable} className="accent-rose-deep" /> Let customers mix flavours within a box
            </label>
            <p className="mt-1 text-[11px] text-muted">When on, multi-piece sizes are split across the flavours above and the box must add up to its piece count.</p>
          </div>

          <div className="mt-4">
            <label className="label">Serving sizes</label>
            <SizeRows initial={sizes.map((s) => ({ id: s.id, label: s.label, piece_count: s.piece_count, price_aed: Number(s.price_aed) }))} />
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-[13px]">
            <label className="flex items-center gap-2">
              <input type="checkbox" name="is_available" defaultChecked={m.is_available} className="accent-rose-deep" /> Visible to customers
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" name="is_featured" defaultChecked={m.is_featured} className="accent-rose-deep" /> Feature on home page
            </label>
          </div>

          <div className="mt-5 flex justify-end">
            <button className="btn-p px-5">Save changes</button>
          </div>
        </form>

        <div className="card h-fit p-4">
          <div className="label">Photo</div>
          <div className="relative mb-3 flex h-[160px] items-center justify-center overflow-hidden rounded-[12px] bg-cream2 text-[48px]">
            {m.image_url ? <Photo src={m.image_url} alt={m.name} fill sizes="260px" className="object-cover" /> : m.emoji}
          </div>
          <form action={uploadItemPhoto} className="grid gap-2">
            <input type="hidden" name="id" value={m.id} />
            <input type="file" name="photo" accept="image/*" required className="text-[12px]" />
            <button className="btn-o py-1.5 text-[12px]">Upload photo</button>
          </form>
          {m.image_url && (
            <form action={removeItemPhoto} className="mt-2">
              <input type="hidden" name="id" value={m.id} />
              <button className="w-full text-[12px] text-muted hover:text-danger">Remove photo</button>
            </form>
          )}
          <p className="mt-2 text-[11px] text-muted">Square JPG or PNG under 4 MB looks best.</p>
          <div className="mt-4 border-t border-line pt-3">
            <ConfirmButton action={deleteMenuItem} hidden={{ id: m.id }} message={`Delete "${m.name}"? This cannot be undone.`} className="text-[12px] text-danger hover:underline">
              Delete this item
            </ConfirmButton>
          </div>
        </div>
      </div>
    </>
  );
}
