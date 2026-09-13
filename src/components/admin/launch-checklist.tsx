import Link from "next/link";
import { adminClient } from "@/lib/supabase/admin";
import { normalizeSettings } from "@/lib/data";
import { isEmailConfigured } from "@/lib/email";
import { isInHouse } from "@/lib/images";
import { env } from "@/lib/env";

/** Shown on the orders board until every launch item is done. */
export async function LaunchChecklist() {
  const db = adminClient();
  const [{ data: sRow }, { data: unpriced }, { data: admins }, { data: photos }] = await Promise.all([
    db.from("settings").select("*").eq("id", 1).maybeSingle(),
    db.from("item_sizes").select("item_id").lte("price_aed", 0),
    db.from("admin_users").select("email"),
    db.from("menu_items").select("image_url").not("image_url", "is", null),
  ]);
  const s = normalizeSettings(sRow);
  const items: { ok: boolean; text: string; href: string }[] = [
    { ok: Boolean(s.whatsapp_number), text: "WhatsApp number set", href: "/admin/settings" },
    { ok: Boolean(s.pickup_address), text: "Pickup address set", href: "/admin/settings" },
    { ok: !s.accept_bank_transfer || Boolean(s.bank_details), text: "Bank transfer details set (or bank transfer switched off)", href: "/admin/settings" },
    { ok: (unpriced?.length ?? 0) === 0, text: `Every size has a price (${unpriced?.length ?? 0} still at AED 0)`, href: "/admin/menu" },
    { ok: !(admins ?? []).some((a) => a.email.endsWith("@example.com")) && ((admins?.length ?? 0) > 0 || env.adminEmails.length > 0), text: "Placeholder admin email replaced", href: "/admin/admins" },
    { ok: (photos ?? []).every((p) => isInHouse(p.image_url)), text: "Photos hosted in your own storage", href: "/admin/settings" },
    { ok: isEmailConfigured(), text: "Email alerts for new orders configured", href: "/admin/settings" },
  ];
  const todo = items.filter((i) => !i.ok);
  if (!todo.length) return null;
  return (
    <div className="mb-4 rounded-[12px] border border-peach-mid bg-peach/60 p-3.5">
      <div className="mb-1.5 text-[12px] font-bold text-peach-deep">
        Launch checklist · {items.length - todo.length} of {items.length} done
      </div>
      <ul className="grid gap-1 text-[12px]">
        {todo.map((i) => (
          <li key={i.text}>
            <Link href={i.href} className="text-peach-deep hover:underline">
              ○ {i.text}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
