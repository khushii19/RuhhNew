import { adminClient } from "@/lib/supabase/admin";
import type { DeliveryZone } from "@/lib/types";
import { deleteZone, saveZone } from "@/app/admin/actions";
import { ConfirmButton } from "@/components/admin/confirm-button";

const COLS = "grid-cols-[1fr_80px_80px_60px_60px_auto]";

export default async function ZonesPage() {
  const { data } = await adminClient().from("delivery_zones").select("*").order("sort_order");
  const zones = (data ?? []) as DeliveryZone[];
  return (
    <>
      <h1 className="mb-1 text-[18px] font-bold">Delivery areas</h1>
      <p className="mb-4 text-[12px] text-muted">Customers pick their area at checkout; the fee and minimum order apply to delivery only. Pickup is always free.</p>
      <div className={`grid ${COLS} gap-1.5 px-1 text-[10px] uppercase tracking-wider text-muted`}>
        <span>Area</span>
        <span>Fee AED</span>
        <span>Min AED</span>
        <span>Order</span>
        <span>Active</span>
        <span />
      </div>
      <div className="mt-1 grid gap-2">
        {zones.map((z) => (
          <div key={z.id} className="card flex items-center gap-1.5 p-2">
            <form action={saveZone} className={`grid flex-1 ${COLS} gap-1.5`}>
              <input type="hidden" name="id" value={z.id} />
              <input name="name" defaultValue={z.name} required className="admin-input" />
              <input name="fee_aed" type="number" min={0} step="0.5" defaultValue={Number(z.fee_aed)} className="admin-input" />
              <input name="min_order_aed" type="number" min={0} step="0.5" defaultValue={Number(z.min_order_aed)} className="admin-input" />
              <input name="sort_order" type="number" defaultValue={z.sort_order} className="admin-input" />
              <label className="flex items-center justify-center">
                <input type="checkbox" name="is_active" defaultChecked={z.is_active} className="accent-rose-deep" />
              </label>
              <button className="btn-o px-3 py-1 text-[12px]">Save</button>
            </form>
            <ConfirmButton action={deleteZone} hidden={{ id: z.id }} message={`Delete "${z.name}"?`} className="px-2 text-[16px] text-muted hover:text-danger">
              ×
            </ConfirmButton>
          </div>
        ))}
      </div>
      <form action={saveZone} className={`card mt-4 grid ${COLS} gap-1.5 p-2`}>
        <input name="name" placeholder="New area" required className="admin-input" />
        <input name="fee_aed" type="number" min={0} step="0.5" defaultValue={15} className="admin-input" />
        <input name="min_order_aed" type="number" min={0} step="0.5" defaultValue={0} className="admin-input" />
        <input name="sort_order" type="number" defaultValue={zones.length + 1} className="admin-input" />
        <label className="flex items-center justify-center">
          <input type="checkbox" name="is_active" defaultChecked className="accent-rose-deep" />
        </label>
        <button className="btn-p px-3 py-1 text-[12px]">Add</button>
      </form>
    </>
  );
}
