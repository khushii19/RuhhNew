import Link from "next/link";
import { CalendarBlank, Moped, Wallet } from "@phosphor-icons/react/dist/ssr";
import { Bestsellers } from "@/components/bestsellers";
import { MenuUnavailable } from "@/components/menu-unavailable";
import { Photo } from "@/components/photo";
import { Reveal, RevealGroup } from "@/components/reveal";
import { SpecialCard } from "@/components/special-card";
import { SpecialsButton } from "@/components/specials-sheet";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { getFeatured } from "@/lib/data";
import { env } from "@/lib/env";
import type { Category, MenuItem, Settings, Special } from "@/lib/types";

export type HomeData = { settings: Settings; specials: Special[]; items: MenuItem[]; categories: Category[] };

/** The home page body. The route fetches the data; the view only renders it. */
export function HomeView({ settings, specials, items, categories }: HomeData) {
  const owner = settings.owner_name;
  // Specials get their own row, so "Bestsellers" shows other bakes.
  const specialNames = new Set(specials.map((s) => s.name.trim().toLowerCase()));
  const featured = getFeatured(
    items.filter((m) => !specialNames.has(m.name.trim().toLowerCase())),
    4,
  );
  const payments = [settings.accept_cash && "cash", settings.accept_bank_transfer && "bank transfer"].filter(Boolean).join(" or ");
  const initials = owner
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mx-auto w-full max-w-[680px]">
      <BakeryJsonLd settings={settings} />

      {/* ---------- hero card ---------- */}
      <section className="m-fade-up overflow-hidden rounded-[16px] border-[1.5px] border-line bg-cream2 text-center">
        {settings.hero_image_url && (
          <div className="p-3 pb-0">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[12px] bg-rose">
              <Photo
                src={settings.hero_image_url}
                alt={`Freshly baked ${settings.business_name} cookies`}
                fill
                priority
                sizes="(max-width: 720px) 100vw, 660px"
                className="object-cover"
              />
            </div>
          </div>
        )}
        <div className="px-6 pb-8 pt-7 md:px-10">
          <span className="inline-block rounded-full bg-rose px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.18em] text-rose-deep">Home baked · Dubai</span>
          <h1 className="mt-4 text-[34px] leading-[1.15] md:text-[42px]">
            Baked to <em className="font-normal italic text-rose-deep">perfection</em>.
          </h1>
          <p className="mx-auto mt-2 max-w-[42ch] text-[14.5px] leading-relaxed text-muted">
            Handmade cookies, cheesecakes &amp; tiramisu, made slowly and from the heart by {owner}.
          </p>
          <p className="mt-2 text-[12px] tracking-[0.06em] text-lav-deep">— by {owner} · est. 2019 —</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2.5">
            <Link href="/menu" className="btn-p press px-6 py-3 text-[14px] font-semibold">
              Browse the menu
            </Link>
            <SpecialsButton specials={specials} settings={settings} className="btn-o press px-6 py-2.5 text-[14px] font-semibold" />
          </div>
        </div>
      </section>

      {/* ---------- this week's specials ---------- */}
      <Section title="This week’s specials">
        {specials.length ? (
          <RevealGroup className="grid gap-3">
            {specials.map((s, i) => (
              <div key={s.id} style={{ "--i": i } as React.CSSProperties}>
                <SpecialCard special={s} leadTimeHours={settings.default_lead_time_hours} />
              </div>
            ))}
          </RevealGroup>
        ) : (
          <p className="text-[13.5px] text-muted">No specials this week — check back soon.</p>
        )}
      </Section>

      {/* ---------- bestsellers ---------- */}
      <Section
        title="Bestsellers"
        action={
          featured.length > 0 && (
            <Link href="/menu" className="text-[13px] font-semibold text-rose-deep underline-offset-4 hover:underline">
              Full menu →
            </Link>
          )
        }
      >
        {featured.length > 0 ? (
          <Bestsellers items={featured} categories={categories} settings={settings} />
        ) : (
          <MenuUnavailable ownerName={owner} whatsappNumber={settings.whatsapp_number} />
        )}
      </Section>

      {/* ---------- say hello ---------- */}
      <Reveal>
        <section aria-labelledby="hello-title" className="mt-10 flex flex-col items-center gap-5 rounded-[16px] bg-rose px-6 py-8 text-center sm:flex-row sm:text-left">
          <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-surface bg-lav font-display text-[26px] text-lav-deep">
            {settings.about_image_url ? (
              <Photo src={settings.about_image_url} alt={owner} fill sizes="96px" className="object-cover" />
            ) : (
              <span aria-hidden>{initials}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="hello-title" className="text-[23px] leading-tight">
              Say hello to {owner}
            </h2>
            <p className="mt-1.5 text-[14px] leading-relaxed text-ink/75">
              Every bake is made by hand in {owner}&rsquo;s Dubai kitchen. Questions, allergies or a special request? Just ask.
            </p>
            <div className="mt-4 flex justify-center sm:justify-start">
              <WhatsAppButton
                number={settings.whatsapp_number}
                message={`Hi ${owner}! I found ${settings.business_name} and would love to know more.`}
                className="press inline-flex items-center gap-2 rounded-full bg-[#15803d] px-5 py-3 text-[14px] font-semibold text-white transition hover:brightness-110"
              >
                Chat with {owner}
              </WhatsAppButton>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ---------- how ordering works ---------- */}
      <Section title="How ordering works">
        <RevealGroup className="grid gap-2.5">
          {[
            { Icon: CalendarBlank, text: `Order ${settings.default_lead_time_hours} hours ahead`, tone: "bg-lav text-lav-deep" },
            { Icon: Moped, text: "Delivery across Dubai or free pickup", tone: "bg-sage text-sage-deep" },
            { Icon: Wallet, text: payments ? `Pay by ${payments}` : "Pay when you collect", tone: "bg-peach text-peach-deep" },
          ].map(({ Icon, text, tone }, i) => (
            <div key={text} style={{ "--i": i } as React.CSSProperties} className="flex items-center gap-3.5 rounded-[12px] border border-line bg-surface px-4 py-3 text-[14px]">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tone}`}>
                <Icon size={19} weight="duotone" aria-hidden />
              </span>
              {text}
            </div>
          ))}
        </RevealGroup>
      </Section>
    </div>
  );
}

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <Reveal>
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 className="text-[22px] leading-tight md:text-[24px]">{title}</h2>
          {action}
        </div>
      </Reveal>
      {children}
    </section>
  );
}

/** Tells search engines this is a bakery and how to reach it. */
function BakeryJsonLd({ settings }: { settings: Settings }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Bakery",
    name: settings.business_name,
    description: `Home-baked cookies, cheesecakes and tiramisu by ${settings.owner_name} in Dubai.`,
    url: env.siteUrl,
    image: settings.hero_image_url ?? undefined,
    telephone: settings.whatsapp_number ? `+${settings.whatsapp_number}` : undefined,
    address: { "@type": "PostalAddress", addressLocality: "Dubai", addressCountry: "AE" },
    servesCuisine: "Desserts",
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}
