import { moveRow } from "@/app/admin/actions";

/** Up / down arrows that reorder a menu item or category. */
export function MoveButtons({ table, id, name, first, last }: { table: "menu_items" | "categories"; id: string; name: string; first: boolean; last: boolean }) {
  const btn = "flex h-6 w-7 items-center justify-center rounded-[6px] text-[11px] text-muted hover:bg-rose hover:text-rose-deep disabled:opacity-25 disabled:hover:bg-transparent";
  return (
    <div className="flex shrink-0 flex-col">
      <form action={moveRow}>
        <input type="hidden" name="table" value={table} />
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="dir" value="up" />
        <button className={btn} disabled={first} aria-label={`Move ${name} up`}>
          ▲
        </button>
      </form>
      <form action={moveRow}>
        <input type="hidden" name="table" value={table} />
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="dir" value="down" />
        <button className={btn} disabled={last} aria-label={`Move ${name} down`}>
          ▼
        </button>
      </form>
    </div>
  );
}
