"use client";

import { useId, useState } from "react";
import { Sparkle } from "@phosphor-icons/react";
import { Photo } from "@/components/photo";
import { Sheet } from "@/components/sheet";
import { ACCENT, useOrderSpecial } from "@/components/special-card";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { aed } from "@/lib/format";
import type { Settings, Special } from "@/lib/types";

/** "This week's special" from the home hero: opens the specials sheet. */
export function SpecialsButton({ specials, settings, className }: { specials: Special[]; settings: Settings; className: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)} aria-haspopup="dialog">
        This week&rsquo;s special
      </button>
      {open && <SpecialsSheet specials={specials} settings={settings} onClose={() => setOpen(false)} />}
    </>
  );
}

function SpecialsSheet({ specials, settings, onClose }: { specials: Special[]; settings: Settings; onClose: () => void }) {
  const titleId = useId();
  const order = useOrderSpecial(settings.default_lead_time_hours);
  const owner = settings.owner_name;

  if (!specials.length) {
    return (
      <Sheet labelledBy={titleId} onClose={onClose}>
        <div className="px-6 pb-10 pt-12 text-center">
          <Sparkle size={40} weight="duotone" className="mx-auto text-rose-deep" aria-hidden />
          <h2 id={titleId} className="mt-4 text-[22px]">
            No specials this week
          </h2>
          <p className="mt-2 text-[14px] text-muted">Check back soon &mdash; {owner} posts something new every week.</p>
        </div>
      </Sheet>
    );
  }

  return (
    <Sheet labelledBy={titleId} onClose={onClose}>
      <h2 id={titleId} className="sr-only">
        This week&rsquo;s special from {settings.business_name}
      </h2>
      {/* Several specials swipe sideways. */}
      <div className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {specials.map((s, i) => {
          const a = ACCENT[s.accent] ?? ACCENT.rose;
          return (
            <section key={s.id} className="w-full shrink-0 snap-center" aria-label={s.name}>
              <div className={`relative flex aspect-[16/10] items-center justify-center overflow-hidden text-[64px] ${a.bg}`}>
                {s.image_url ? <Photo src={s.image_url} alt={s.name} fill sizes="480px" className="object-cover" /> : <span aria-hidden>{s.emoji}</span>}
                {specials.length > 1 && (
                  <span className="absolute bottom-3 left-3 rounded-full bg-surface/90 px-2.5 py-1 text-[11px] font-semibold text-ink">
                    {i + 1} of {specials.length} · swipe
                  </span>
                )}
              </div>
              <div className="px-5 pb-6 pt-5 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">This week&rsquo;s special from {settings.business_name}</p>
                <h3 className="mt-2 text-[24px] leading-tight">{s.name}</h3>
                {s.description && <p className="mx-auto mt-1.5 max-w-[36ch] text-[14px] leading-relaxed text-muted">{s.description}</p>}
                <p className={`mx-auto mt-3 inline-block rounded-full px-3 py-1 text-[11.5px] font-semibold ${a.bg} ${a.text}`}>Available this week only</p>
                <div className="mt-3 flex items-baseline justify-center gap-2">
                  <span className={`price text-[24px] font-semibold ${a.text}`}>{aed(s.price_aed)}</span>
                  {s.old_price_aed != null && <span className="price text-[14px] text-muted line-through">{aed(s.old_price_aed)}</span>}
                </div>
                <div className="mt-5 flex flex-col gap-2.5">
                  <button
                    type="button"
                    className="btn-p press w-full py-3.5 text-[14.5px] font-semibold"
                    disabled={s.price_aed <= 0}
                    onClick={() => {
                      order(s);
                      onClose();
                    }}
                  >
                    Add to basket &amp; order
                  </button>
                  <WhatsAppButton number={settings.whatsapp_number} message={`Hi ${owner}! I would love to reserve the ${s.name} this week. Can I book one?`}>
                    Reserve via WhatsApp
                  </WhatsAppButton>
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </Sheet>
  );
}
