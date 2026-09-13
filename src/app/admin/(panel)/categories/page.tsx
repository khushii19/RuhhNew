import { adminClient } from "@/lib/supabase/admin";
import type { Category } from "@/lib/types";
import { deleteCategory, saveCategory } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/confirm-button";

export default async function CategoriesPage() {
  const { data } = await adminClient().from("categories").select("*, menu_items(count)").order("sort_order");
  const cats = (data ?? []) as (Category & { menu_items: { count: number }[] })[];
  return (
    <>
      <h1 className="mb-1 text-[18px] font-bold">Categories</h1>
      <p className="mb-4 text-[12px] text-muted">
        Filter tabs customers see on the menu. Lead time is the minimum notice in hours for items in that category; leave blank to use the default from Settings.
      </p>
      <div className="grid gap-2">
        <div className="grid grid-cols-[1fr_70px_90px_auto_auto] gap-1.5 px-1 text-[10px] uppercase tracking-wider text-muted">
          <span>Name</span>
          <span>Order</span>
          <span>Lead (h)</span>
          <span />
          <span />
        </div>
        {cats.map((c) => (
          <div key={c.id} className="card flex items-center gap-1.5 p-2">
            <form action={saveCategory} className="grid flex-1 grid-cols-[1fr_70px_90px_auto] gap-1.5">
              <input type="hidden" name="id" value={c.id} />
              <input name="name" defaultValue={c.name} required className="admin-input" />
              <input name="sort_order" type="number" defaultValue={c.sort_order} className="admin-input" />
              <input name="lead_time_hours" type="number" min={0} defaultValue={c.lead_time_hours ?? ""} placeholder="default" className="admin-input" />
              <button className="btn-o px-3 py-1 text-[12px]">Save</button>
            </form>
            <ConfirmButton
              action={deleteCategory}
              hidden={{ id: c.id }}
              message={`Delete "${c.name}"? Its ${c.menu_items?.[0]?.count ?? 0} item(s) will become uncategorised.`}
              className="px-2 text-[16px] text-muted hover:text-danger"
            >
              ×
            </ConfirmButton>
          </div>
        ))}
      </div>
      <form action={saveCategory} className="card mt-4 grid grid-cols-[1fr_70px_90px_auto] gap-1.5 p-2">
        <input name="name" placeholder="New category" required className="admin-input" />
        <input name="sort_order" type="number" defaultValue={cats.length + 1} className="admin-input" />
        <input name="lead_time_hours" type="number" min={0} placeholder="default" className="admin-input" />
        <button className="btn-p px-3 py-1 text-[12px]">Add</button>
      </form>
    </>
  );
}
