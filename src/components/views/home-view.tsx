import Link from "next/link";
import { Basket, Cake, CalendarCheck, ChatCircleDots, Cookie, Moped, Sparkle } from "@phosphor-icons/react/dist/ssr";
import { BrandSeal } from "@/components/brand-logo";
import { HomeShop } from "@/components/home-shop";
import { MenuUnavailable } from "@/components/menu-unavailable";
import { Photo } from "@/components/photo";
import { Reveal, RevealGroup } from "@/components/reveal";
import { SpecialCard } from "@/components/special-card";
import { SpecialsButton } from "@/components/specials-sheet";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { getFeatured } from "@/lib/data";
import { env } from "@/lib/env";
import { aed } from "@/lib/format";
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
  const pickup = settings.pickup_address?.split(",")[0]?.trim();
  const payments = [settings.accept_cash && "cash", settings.accept_bank_transfer && "bank transfer"].filter(Boolean).join(" or ");
  const special = specials[0];

  return (
    <div className="mx-auto w-full max-w-[1080px]">
      <BakeryJsonLd settings={settings} />

      {/* ---------- hero: the first build's cream card, now with the photo beside it ---------- */}
      <section className="m-fade-up overflow-hidden rounded-[20px] border-[1.5px] border-line bg-cream2">
        <div className="grid items-center md:grid-cols-[1fr_1.05fr]">
          <div className="relative order-1 p-3 md:order-2 md:p-5 md:pl-0">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[14px] bg-rose md:aspect-[5/4]">
              {settings.hero_image_url && (
                <Photo
                  src={settings.hero_image_url}
                  alt={`Freshly baked ${settings.business_name} cookies`}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 540px"
                  className="hero-zoom object-cover"
                />
              )}
              {special && (
                <span className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-surface/95 px-3 py-1.5 text-[12px] text-ink shadow-[0_8px_20px_-10px_rgba(44,26,26,0.45)]">
                  <Sparkle size={14} weight="fill" className="text-rose-deep" aria-hidden />
                  This week: {special.name}
                  {special.price_aed > 0 && <span className="price font-semibold">· {aed(special.price_aed)}</span>}
                </span>
              )}
            </div>
            {/* The Ruhh seal, pinned to the photo's corner. */}
            <div className="m-float absolute -bottom-7 left-7 rounded-full bg-surface p-1 shadow-[0_14px_30px_-14px_rgba(155,75,107,0.6)] md:-left-9 md:bottom-10">
              <BrandSeal size={88} />
            </div>
          </div>

          <div className="order-2 px-6 pb-9 pt-12 text-center md:order-1 md:px-12 md:py-14 md:text-left">
            <span className="inline-block rounded-full bg-rose px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.18em] text-rose-deep">Home baked · Dubai</span>
            <h1 className="mt-4 pb-1 text-[38px] leading-[1.1] md:text-[56px]">
              Baked to <em className="font-normal italic text-rose-deep">perfection</em>.
            </h1>
            <p className="mx-auto mt-3 max-w-[40ch] text-[15px] leading-relaxed text-muted md:mx-0 md:text-[16.5px]">
              Handmade cookies, cheesecakes &amp; tiramisu, made slowly and from the heart by {owner}.
            </p>
            <p className="mt-2 text-[12.5px] tracking-[0.06em] text-lav-deep">— by {owner} · est. 2019 —</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2.5 md:justify-start">
              <a href="#shop" className="btn-p press px-6 py-3 text-[14.5px] font-semibold">
                <Basket size={17} weight="bold" aria-hidden /> Order now
              </a>
              <SpecialsButton specials={specials} settings={settings} className="btn-o press px-6 py-2.5 text-[14.5px] font-semibold" />
            </div>
          </div>
        </div>
      </section>

      {/* ---------- the practical benefits ---------- */}
      <RevealGroup className="mt-5 grid grid-cols-2 gap-2.5 md:mt-6 md:grid-cols-4 md:gap-4">
        {[
          { Icon: CalendarCheck, title: "Baked to order", sub: `Fresh for your date · ${settings.default_lead_time_hours}h notice`, tone: "bg-rose", icon: "text-rose-deep" },
          { Icon: Moped, title: "Delivered in Dubai", sub: pickup ? `Or free pickup in ${pickup}` : "Or free pickup", tone: "bg-sage", icon: "text-sage-deep" },
          { Icon: Cookie, title: "Mix your own box", sub: "Pick every flavour yourself", tone: "bg-peach", icon: "text-peach-deep" },
          { Icon: ChatCircleDots, title: "Order on WhatsApp", sub: `${owner} confirms personally`, tone: "bg-lav", icon: "text-lav-deep" },
        ].map(({ Icon, title, sub, tone, icon }, i) => (
          <div key={title} style={{ "--i": i } as React.CSSProperties} className={`flex h-full flex-col gap-2 rounded-[16px] p-4 md:p-5 ${tone}`}>
            <span className={`flex h-10 w-10 items-center justify-center rounded-full bg-surface ${icon}`}>
              <Icon size={20} weight="duotone" aria-hidden />
            </span>
            <span className="font-display text-[15.5px] leading-snug md:text-[17px]">{title}</span>
            <span className="text-[12.5px] leading-snug text-ink/70">{sub}</span>
          </div>
        ))}
      </RevealGroup>

      {/* ---------- this week's specials ---------- */}
      <Section title="This week’s specials" kicker="Fresh this week">
        {specials.length ? (
          <RevealGroup className="grid gap-3 md:grid-cols-2 md:gap-4">
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

      {/* ---------- the whole menu ---------- */}
      <Section title="The menu" kicker="Tap + to add" action={<Link href="/menu" className="text-[13px] font-semibold text-rose-deep underline-offset-4 hover:underline">Search the menu →</Link>}>
        {items.length > 0 ? (
          <HomeShop items={items} featured={featured} categories={categories} settings={settings} />
        ) : (
          <MenuUnavailable ownerName={owner} whatsappNumber={settings.whatsapp_number} />
        )}
      </Section>

      {/* ---------- how ordering works ---------- */}
      <Section title="How ordering works" kicker="Three easy steps">
        <RevealGroup className="grid gap-3 md:grid-cols-3 md:gap-4">
          {[
            { title: "Pick your treats", sub: "Choose sizes and flavours, or mix your own box." },
            { title: "Choose a date", sub: `Delivery across Dubai or free pickup, ${settings.default_lead_time_hours} hours ahead.` },
            { title: "Send on WhatsApp", sub: `${owner} confirms and bakes it fresh.${payments ? ` Pay by ${payments}.` : ""}` },
          ].map((step, i) => (
            <div key={step.title} style={{ "--i": i } as React.CSSProperties} className="flex gap-4 rounded-[16px] border border-line bg-surface p-5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-deep font-display text-[18px] text-white">{i + 1}</span>
              <span>
                <span className="block font-display text-[17px] leading-snug">{step.title}</span>
                <span className="mt-1 block text-[13.5px] leading-relaxed text-muted">{step.sub}</span>
              </span>
            </div>
          ))}
        </RevealGroup>
      </Section>

      {/* ---------- the baker ---------- */}
      <Reveal>
        <section aria-labelledby="hello-title" className="mt-14 grid items-center gap-7 overflow-hidden rounded-[20px] bg-rose p-4 md:mt-20 md:grid-cols-[0.9fr_1.1fr] md:gap-12 md:p-6">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[14px] bg-lav md:aspect-[5/6]">
            {settings.about_image_url && <Photo src={settings.about_image_url} alt={`${owner} baking`} fill sizes="(max-width: 768px) 100vw, 460px" className="object-cover" />}
          </div>
          <div className="px-2 pb-4 text-center md:pr-8 md:text-left">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-rose-deep">The baker behind Ruhh</p>
            <h2 id="hello-title" className="mt-3 text-[30px] leading-[1.12] md:text-[42px]">
              Say hello to {owner}
            </h2>
            {settings.about_text && <p className="mx-auto mt-4 max-w-[46ch] font-display text-[17px] italic leading-[1.65] text-ink/80 md:mx-0 md:text-[19px]">{settings.about_text}</p>}
            <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row md:justify-start">
              <BrandSeal size={72} variant="primary" className="bg-cream" />
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

      {/* ---------- custom cakes ---------- */}
      <Reveal>
        <section className="mt-5 flex flex-col items-center gap-5 rounded-[20px] border-[1.5px] border-dashed border-peach-mid bg-peach px-6 py-9 text-center md:flex-row md:justify-between md:px-10 md:text-left">
          <div className="flex flex-col items-center gap-4 md:flex-row">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-surface text-peach-deep">
              <Cake size={28} weight="duotone" aria-hidden />
            </span>
            <div>
              <h2 className="text-[24px] leading-tight md:text-[28px]">Planning a celebration?</h2>
              <p className="mt-1 text-[14px] text-ink/70">Birthdays, anniversaries and showers, designed with {owner}.</p>
            </div>
          </div>
          <Link href="/custom-cakes" className="btn-p press shrink-0 px-6 py-3 text-[14.5px] font-semibold">
            Design a custom cake
          </Link>
        </section>
      </Reveal>
    </div>
  );
}

function Section({ title, kicker, action, children }: { title: string; kicker?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="mt-14 md:mt-20">
      <Reveal>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            {kicker && <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-rose-deep">{kicker}</p>}
            <h2 className="text-[28px] leading-tight md:text-[36px]">{title}</h2>
          </div>
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
