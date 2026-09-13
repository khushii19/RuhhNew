import { Photo } from "@/components/photo";
import { adminClient } from "@/lib/supabase/admin";
import { normalizeSettings } from "@/lib/data";
import { isWhatsAppApiConfigured } from "@/lib/env";
import { removeLogo, removeSettingImage, saveSettings, uploadLogo, uploadSettingImage } from "@/app/admin/actions";
import { ImportPhotosButton } from "@/components/admin/import-photos-button";
import { isEmailConfigured } from "@/lib/email";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const sp = await searchParams;
  const { data } = await adminClient().from("settings").select("*").eq("id", 1).maybeSingle();
  const s = normalizeSettings(data);
  return (
    <>
      <h1 className="mb-3 text-[18px] font-bold">Settings</h1>
      {sp.saved && <div className="mb-3 rounded-[10px] bg-sage/50 p-2.5 text-[12px] text-sage-deep">Settings saved.</div>}

      <div className="grid gap-4 md:grid-cols-[1fr_260px]">
        <form action={saveSettings} className="grid gap-4">
          <section className="card p-4">
            <h2 className="mb-3 text-[14px] font-bold">Brand</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label">Business name</label>
                <input name="business_name" defaultValue={s.business_name} className="admin-input" />
              </div>
              <div>
                <label className="label">Tagline</label>
                <input name="tagline" defaultValue={s.tagline} className="admin-input" />
              </div>
              <div>
                <label className="label">Owner first name</label>
                <input name="owner_name" defaultValue={s.owner_name} className="admin-input" />
              </div>
              <div>
                <label className="label">Instagram handle</label>
                <input name="instagram_handle" defaultValue={s.instagram_handle ?? ""} placeholder="ruhh.dubai" className="admin-input" />
              </div>
            </div>
            <div className="mt-3">
              <label className="label">About text (home page)</label>
              <textarea name="about_text" defaultValue={s.about_text} className="admin-input min-h-[60px]" />
            </div>
          </section>

          <section className="card p-4">
            <h2 className="mb-3 text-[14px] font-bold">Contact &amp; payment</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label">WhatsApp number (digits, international)</label>
                <input name="whatsapp_number" defaultValue={s.whatsapp_number} placeholder="971501234567" inputMode="numeric" className="admin-input" />
              </div>
              <div>
                <label className="label">Pickup address</label>
                <input name="pickup_address" defaultValue={s.pickup_address ?? ""} className="admin-input" />
              </div>
            </div>
            <div className="mt-3">
              <label className="label">Bank transfer details (shown to customers who choose bank transfer)</label>
              <textarea name="bank_details" defaultValue={s.bank_details ?? ""} className="admin-input min-h-[60px]" placeholder="Bank, account name, IBAN" />
            </div>
            <div className="mt-3">
              <label className="label">Tax note (optional, shown under the total and on WhatsApp orders)</label>
              <input name="tax_note" defaultValue={s.tax_note ?? ""} placeholder="e.g. Prices include 5% VAT · TRN 100000000000003" className="admin-input" />
            </div>
            <div className="mt-3 flex flex-wrap gap-4 text-[13px]">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="accept_cash" defaultChecked={s.accept_cash} className="accent-rose-deep" /> Accept cash
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="accept_bank_transfer" defaultChecked={s.accept_bank_transfer} className="accent-rose-deep" /> Accept bank transfer
              </label>
            </div>
            <p className="mt-2 text-[11px] text-muted">
              WhatsApp Business API: <b>{isWhatsAppApiConfigured() ? "connected" : "not configured"}</b> · Email alerts for new orders:{" "}
              <b>{isEmailConfigured() ? "on" : "not configured"}</b> (both set in the hosting environment variables — see README).
            </p>
          </section>

          <section className="card p-4">
            <h2 className="mb-3 text-[14px] font-bold">Availability</h2>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="label">Default lead time (hours)</label>
                <input name="default_lead_time_hours" type="number" min={0} defaultValue={s.default_lead_time_hours} className="admin-input" />
              </div>
              <div>
                <label className="label">Daily order cap (blank = none)</label>
                <input name="daily_order_cap" type="number" min={1} defaultValue={s.daily_order_cap ?? ""} className="admin-input" />
              </div>
              <div>
                <label className="label">Orders per time slot (blank = unlimited)</label>
                <input name="slot_capacity" type="number" min={1} defaultValue={s.slot_capacity ?? ""} className="admin-input" />
              </div>
              <div>
                <label className="label">Free delivery over AED (blank = never)</label>
                <input name="free_delivery_over" type="number" min={0} defaultValue={s.free_delivery_over ?? ""} className="admin-input" />
              </div>
            </div>
            <div className="mt-3">
              <label className="label">Closed on</label>
              <div className="flex flex-wrap gap-3 text-[13px]">
                {DAYS.map((d, i) => (
                  <label key={d} className="flex items-center gap-1.5">
                    <input type="checkbox" name={`closed_${i}`} defaultChecked={s.closed_weekdays.includes(i)} className="accent-rose-deep" /> {d}
                  </label>
                ))}
              </div>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label">Closed dates (one per line, YYYY-MM-DD)</label>
                <textarea name="closed_dates" defaultValue={s.closed_dates.join("\n")} className="admin-input min-h-[90px]" placeholder="2026-12-25" />
              </div>
              <div>
                <label className="label">Time slots (one per line)</label>
                <textarea name="slots" defaultValue={s.slots.join("\n")} className="admin-input min-h-[90px]" />
              </div>
            </div>
          </section>

          <div className="flex justify-end">
            <button className="btn-p px-6">Save settings</button>
          </div>
        </form>

        <div className="card h-fit p-4">
          <div className="label">Logo</div>
          <div className="relative mx-auto mb-3 flex h-[96px] w-[96px] items-center justify-center overflow-hidden rounded-full bg-rose text-[12px] text-rose-deep">
            {s.logo_url ? <Photo src={s.logo_url} alt="Logo" fill sizes="96px" className="object-cover" /> : "No logo"}
          </div>
          <form action={uploadLogo} className="grid gap-2">
            <input type="file" name="logo" accept="image/*" required className="text-[12px]" />
            <button className="btn-o py-1.5 text-[12px]">Upload logo</button>
          </form>
          {s.logo_url && (
            <form action={removeLogo} className="mt-2">
              <button className="w-full text-[12px] text-muted hover:text-danger">Remove logo</button>
            </form>
          )}
          <p className="mt-2 text-[11px] text-muted">Optional. The Ruhh wordmark ships with the app; upload a file here only to replace it in the header.</p>

          <div className="mt-5 border-t border-line pt-4">
            <div className="label">Photo hosting</div>
            <ImportPhotosButton />
          </div>

          {(
            [
              ["hero_image_url", "Home page hero photo", s.hero_image_url, "Wide landscape photo of your bakes. Shown behind the headline on the home page."],
              ["about_image_url", "About photo", s.about_image_url, "A photo of you or your kitchen for the “Say hello” section."],
            ] as const
          ).map(([field, label, url, hint]) => (
            <div key={field} className="mt-5 border-t border-line pt-4">
              <div className="label">{label}</div>
              <div className="relative mb-2 h-[110px] overflow-hidden rounded-[10px] bg-cream2">
                {url ? <Photo src={url} alt="" fill sizes="260px" className="object-cover" /> : <div className="flex h-full items-center justify-center text-[12px] text-muted">No photo</div>}
              </div>
              <form action={uploadSettingImage} className="grid gap-2">
                <input type="hidden" name="field" value={field} />
                <input type="file" name="image" accept="image/*" required className="text-[12px]" />
                <button className="btn-o py-1.5 text-[12px]">Upload</button>
              </form>
              {url && (
                <form action={removeSettingImage} className="mt-1">
                  <input type="hidden" name="field" value={field} />
                  <button className="w-full text-[12px] text-muted hover:text-danger">Remove</button>
                </form>
              )}
              <p className="mt-1 text-[11px] text-muted">{hint}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
