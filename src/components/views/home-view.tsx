import Link from "next/link";
import { ArrowRight, CalendarCheck, ChatCircleDots, Moped, Storefront } from "@phosphor-icons/react/dist/ssr";
import { BrandSeal } from "@/components/brand-logo";
import { HomeBestsellers } from "@/components/home-shop";
import { MenuUnavailable } from "@/components/menu-unavailable";
import { Photo } from "@/components/photo";
import { Reveal, RevealGroup } from "@/components/reveal";
import { SpecialCard } from "@/components/special-card";
import { SpecialsButton } from "@/components/specials-sheet";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { categoryArt } from "@/lib/category-art";
import { getFeatured } from "@/lib/data";
import { env } from "@/lib/env";
import type { Category, MenuItem, Settings, Special } from "@/lib/types";

export type HomeData = { settings: Settings; specials: Special[]; items: MenuItem[]; categories: Category[] };

const TILE_BG = ["bg-rose", "bg-lav", "bg-sage", "bg-peach"];

/** The home page body. The route fetches the data; the view only renders it. */
export function HomeView({ settings, specials, items, categories }: HomeData) {
  const owner = settings.owner_name;
  // Specials get their own row, so "Bestsellers" shows other bakes.
  const specialNames = new Set(specials.map((s) => s.name.trim().toLowerCase()));
  const featured = getFeatured(
    items.filter((m) => !specialNames.has(m.name.trim().toLowerCase())),
    4,
  );
  // One tile per category, pictured by its first bake with a photo.
  const shelves = categories
    .map((c) => {
      const list = items.filter((m) => m.category_id === c.id);
      return { cat: c, count: list.length, photo: list.find((m) => m.image_url)?.image_url ?? null };
    })
    .filter((s) => s.count > 0);
  const pickup = settings.pickup_address?.split(",")[0]?.trim();

  return (
    <div className="mx-auto w-full max-w-[1080px]">
      <BakeryJsonLd settings={settings} />

      {/* ---------- hero: photo and words, no box around them ---------- */}
      <section className="grid items-center gap-7 md:grid-cols-[1fr_1.05fr] md:gap-14">
        <div className="relative md:order-2">
          <div className="relative aspect-[5/4] overflow-hidden rounded-[26px] bg-rose md:aspect-[4/5]">
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
          </div>
          <div className="m-float absolute -bottom-6 right-5 rounded-full bg-surface p-1 shadow-[0_16px_34px_-14px_rgba(155,75,107,0.55)] md:-left-10 md:bottom-12 md:right-auto">
            <BrandSeal size={84} />
          </div>
        </div>

        <div className="m-fade-up text-center md:order-1 md:text-left">
          <p className="text-[13px] font-medium tracking-[0.02em] text-rose-deep">Home baked in Dubai · since 2019</p>
          <h1 className="mt-3 text-[42px] leading-[1.05] tracking-[-0.01em] md:text-[64px]">
            Baked to <em className="font-normal italic text-rose-deep">perfection</em>.
          </h1>
          <p className="mx-auto mt-4 max-w-[34ch] text-[16px] leading-relaxed text-ink/70 md:mx-0 md:text-[17.5px]">
            Cookies, cheesecakes &amp; tiramisu, made slowly and from the heart by {owner}.
          </p>
          <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row md:justify-start">
            <Link href="/menu" className="btn-p press w-full px-8 py-4 text-[15px] font-semibold sm:w-auto">
              Order now <ArrowRight size={17} weight="bold" aria-hidden />
            </Link>
            {specials.length > 0 && (
              <SpecialsButton
                specials={specials}
                settings={settings}
                className="press rounded-full px-5 py-3 text-[14.5px] font-semibold text-rose-deep underline-offset-4 hover:underline"
              />
            )}
          </div>
        </div>
      </section>

      {/* ---------- the practical promises, in one soft band ---------- */}
      <Reveal>
        <div className="bleed mt-14 bg-rose md:mt-16">
          <ul className="mx-auto grid max-w-[1080px] grid-cols-2 gap-x-4 gap-y-4 px-5 py-6 md:grid-cols-4 md:px-6 md:py-7">
            {[
              { Icon: CalendarCheck, text: `Baked fresh to order · ${settings.default_lead_time_hours}h notice` },
              { Icon: Moped, text: "Delivery across Dubai" },
              { Icon: Storefront, text: pickup ? `Free pickup in ${pickup}` : "Free pickup" },
              { Icon: ChatCircleDots, text: `${owner} confirms on WhatsApp` },
            ].map(({ Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-[13.5px] font-medium leading-snug text-rose-deep">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface">
                  <Icon size={20} weight="duotone" aria-hidden />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
      </Reveal>

      {/* ---------- this week ---------- */}
      {specials.length > 0 && (
        <Section title="This week’s specials">
          <RevealGroup className="grid gap-3 md:grid-cols-2 md:gap-5">
            {specials.map((s, i) => (
              <div key={s.id} style={{ "--i": i } as React.CSSProperties}>
                <SpecialCard special={s} leadTimeHours={settings.default_lead_time_hours} />
              </div>
            ))}
          </RevealGroup>
        </Section>
      )}

      {/* ---------- bestsellers ---------- */}
      <Section title="Bestsellers" link={{ href: "/menu", label: "Full menu" }}>
        {featured.length > 0 ? (
          <HomeBestsellers items={featured} categories={categories} settings={settings} />
        ) : (
          <MenuUnavailable ownerName={owner} whatsappNumber={settings.whatsapp_number} />
        )}
      </Section>

      {/* ---------- shop by category ---------- */}
      {shelves.length > 0 && (
        <Section title="Shop by treat">
          <RevealGroup className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 md:gap-x-5 md:gap-y-8">
            {shelves.map(({ cat, count, photo }, i) => (
              <Link key={cat.id} href={`/menu?cat=${cat.id}`} style={{ "--i": i } as React.CSSProperties} className="group block">
                <span className={`relative block aspect-[4/3] overflow-hidden rounded-[20px] ${TILE_BG[i % 4]}`}>
                  <Photo
                    src={photo ?? categoryArt(cat.name)}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 50vw, 340px"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                  />
                </span>
                <span className="mt-2.5 flex items-baseline justify-between gap-2 px-0.5">
                  <span className="font-display text-[16px] leading-snug text-ink transition-colors group-hover:text-rose-deep md:text-[18px]">{cat.name}</span>
                  <span className="shrink-0 text-[12.5px] text-muted">
                    {count} {count === 1 ? "bake" : "bakes"}
                  </span>
                </span>
              </Link>
            ))}
          </RevealGroup>
        </Section>
      )}

      {/* ---------- how it works ---------- */}
      <Section title="How ordering works">
        <RevealGroup className="grid gap-6 md:grid-cols-3 md:gap-10">
          {[
            { title: "Pick your treats", sub: "Choose a size, a flavour, or mix your own box." },
            { title: "Choose a day", sub: `Delivery across Dubai or free pickup, ${settings.default_lead_time_hours} hours ahead.` },
            { title: "Send on WhatsApp", sub: `${owner} confirms and bakes it fresh for you.` },
          ].map((step, i) => (
            <div key={step.title} style={{ "--i": i } as React.CSSProperties} className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose font-display text-[19px] text-rose-deep">{i + 1}</span>
              <span>
                <span className="block font-display text-[18px] leading-snug">{step.title}</span>
                <span className="mt-1 block text-[14px] leading-relaxed text-ink/65">{step.sub}</span>
              </span>
            </div>
          ))}
        </RevealGroup>
      </Section>

      {/* ---------- the baker ---------- */}
      <Reveal>
        <section aria-labelledby="hello-title" className="mt-16 grid items-center gap-8 md:mt-24 md:grid-cols-2 md:gap-14">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[26px] bg-lav md:aspect-square">
            {settings.about_image_url && <Photo src={settings.about_image_url} alt={`${owner} baking`} fill sizes="(max-width: 768px) 100vw, 520px" className="object-cover" />}
          </div>
          <div className="text-center md:text-left">
            <h2 id="hello-title" className="text-[32px] leading-[1.1] md:text-[44px]">
              Say hello to <em className="font-normal italic text-rose-deep">{owner}</em>
            </h2>
            {settings.about_text && <p className="mx-auto mt-4 max-w-[44ch] font-display text-[18px] italic leading-[1.65] text-ink/75 md:mx-0 md:text-[20px]">{settings.about_text}</p>}
            <div className="mt-7 flex justify-center md:justify-start">
              <WhatsAppButton
                number={settings.whatsapp_number}
                message={`Hi ${owner}! I found ${settings.business_name} and would love to know more.`}
                className="press inline-flex items-center gap-2 rounded-full bg-[#15803d] px-6 py-3.5 text-[14.5px] font-semibold text-white transition hover:brightness-110"
              >
                Chat with {owner}
              </WhatsAppButton>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ---------- custom cakes ---------- */}
      <Reveal>
        <Link
          href="/custom-cakes"
          className="group mt-16 flex items-center justify-between gap-5 rounded-[26px] bg-lav px-6 py-8 transition-colors hover:bg-rose md:mt-24 md:px-12 md:py-12"
        >
          <span>
            <span className="block font-display text-[26px] leading-tight text-ink md:text-[36px]">Planning a celebration?</span>
            <span className="mt-1.5 block text-[14.5px] text-ink/65">Custom cakes, designed with {owner}.</span>
          </span>
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-rose-deep text-white transition-transform group-hover:translate-x-1">
            <ArrowRight size={22} weight="bold" aria-hidden />
            <span className="sr-only">Design a custom cake</span>
          </span>
        </Link>
      </Reveal>
    </div>
  );
}

function Section({ title, link, children }: { title: string; link?: { href: string; label: string }; children: React.ReactNode }) {
  return (
    <section className="mt-14 md:mt-20">
      <Reveal>
        <div className="mb-5 flex items-baseline justify-between gap-4 md:mb-7">
          <h2 className="text-[27px] leading-tight md:text-[36px]">{title}</h2>
          {link && (
            <Link href={link.href} className="inline-flex shrink-0 items-center gap-1 text-[14px] font-semibold text-rose-deep underline-offset-4 hover:underline">
              {link.label} <ArrowRight size={14} weight="bold" aria-hidden />
            </Link>
          )}
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
