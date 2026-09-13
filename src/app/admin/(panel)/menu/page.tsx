import { Photo } from "@/components/photo";
import Link from "next/link";
import { adminClient } from "@/lib/supabase/admin";
import { ITEM_SELECT } from "@/lib/data";
import { aed } from "@/lib/format";
import type { Category, MenuItem } from "@/lib/types";
import { createMenuItem } from "@/app/admin/actions";
import { AvailabilityToggle } from "@/components/admin/availability-toggle";

export default async function AdminMenuPage() {
  const db = adminClient();
  const [{ data: items }, { data: cats }] = await Promise.all([
    db.from("menu_items").select(ITEM_SELECT).order("sort_order"),
    db.from("categories").select("*").order("sort_order"),
  ]);
  const categories = (cats ?? []) as Category[];
  const all = (items ?? []) as MenuItem[];
  const groups = [...categories.map((c) => ({ cat: c, items: all.filter((i) => i.category_id === c.id) })), { cat: null, items: all.filter((i) => !i.category_id) }].filter((g) => g.items.length);

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-[18px] font-bold">Menu</h1>
        <form action={createMenuItem}>
          <button className="btn-p px-3.5 py-1.5 text-[12px]">+ Add item</button>
        </form>
      </div>
      {groups.map((g) => (
        <section key={g.cat?.id ?? "none"} className="mb-5">
          <h2 className="sec-head">{g.cat?.name ?? "Uncategorised"}</h2>
          <div className="grid gap-2">
            {g.items.map((m) => {
              const prices = m.item_sizes.map((s) => Number(s.price_aed));
              const unpriced = prices.some((p) => p <= 0);
              return (
                <div key={m.id} className={`card flex items-center gap-3 p-3 ${m.is_available ? "" : "opacity-60"}`}>
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-cream2 text-[22px]">
                    {m.image_url ? <Photo src={m.image_url} alt="" fill sizes="48px" className="object-cover" /> : m.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/admin/menu/${m.id}`} className="text-[13px] font-bold hover:text-rose-deep">
                      {m.name}
                    </Link>
                    <div className="text-[11px] text-muted">
                      {m.item_sizes.map((s) => `${s.label} ${aed(Number(s.price_aed))}`).join(" · ")}
                      {m.item_flavours.length ? ` · ${m.item_flavours.length} flavours${m.mixable ? " (mix)" : ""}` : ""}
                    </div>
                    {unpriced && <span className="tag mt-1 bg-peach text-peach-deep">price missing</span>}
                  </div>
                  <AvailabilityToggle id={m.id} available={m.is_available} />
                  <Link href={`/admin/menu/${m.id}`} className="btn-o px-3 py-1 text-[12px]">
                    Edit
                  </Link>
                </div>
              );
            })}
          </div>
        </section>
      ))}
      {all.length === 0 && <div className="card p-8 text-center text-[13px] text-muted">No menu items yet.</div>}
    </>
  );
}
