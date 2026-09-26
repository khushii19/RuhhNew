import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  ChatCircleDots,
  Moped,
  Storefront,
} from "@phosphor-icons/react/dist/ssr";
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

export type HomeData = {
  settings: Settings;
  specials: Special[];
  items: MenuItem[];
  categories: Category[];
};

const TILE_BG = ["bg-rose", "bg-lav", "bg-sage", "bg-peach"];

/** The home page body. The route fetches the data; the view only renders it. */
export function HomeView({ settings, specials, items, categories }: HomeData) {
  const owner = settings.owner_name;
  // Specials get their own row, so "Bestsellers" shows other bakes.
  const specialNames = new Set(
    specials.map((s) => s.name.trim().toLowerCase()),
  );
  const featured = getFeatured(
    items.filter((m) => !specialNames.has(m.name.trim().toLowerCase())),
    4,
  );
  // One tile per category, pictured by its first bake with a photo.
  const shelves = categories
    .map((c) => {
      const list = items.filter((m) => m.category_id === c.id);
      return {
        cat: c,
        count: list.length,
        photo: list.find((m) => m.image_url)?.image_url ?? null,
      };
    })
    .filter((s) => s.count > 0);
  const pickup = settings.pickup_address?.split(",")[0]?.trim();

  return (
    <div className="mx-auto w-full max-w-[1080px]">
      <BakeryJsonLd settings={settings} />

      {/* ---------- hero: photo and words, no box around them ---------- */}
      <section className="grid items-center gap-8 md:grid-cols-[1fr_1.05fr] md:gap-16">
        <div className="md:order-2">
          <div className="relative aspect-[5/4] overflow-hidden rounded-[16px] bg-rose md:aspect-[4/5]">
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
        </div>

        <div className="m-fade-up text-center md:order-1 md:text-left">
          <p className="text-[13px] font-semibold uppercase tracking-[0.14em] text-rose-deep">
            Handmade in Dubai since 2019
          </p>
          <h1 className="mt-3 text-[42px] leading-[1.05] tracking-[-0.01em] md:text-[64px]">
            Baked to{" "}
            <em className="font-normal italic text-rose-deep">perfection</em>.
          </h1>
          <p className="mx-auto mt-4 max-w-[36ch] text-[16px] leading-relaxed text-ink/70 md:mx-0 md:text-[18px]">
            Small-batch cookies, cheesecakes and tiramisu, baked to order by{" "}
            {owner}.
          </p>
          <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row md:justify-start">
            <Link
              href="/menu"
              className="btn-p press min-h-[52px] w-full px-8 text-[15px] sm:w-auto"
            >
              Order now
            </Link>
            {specials.length > 0 && (
              <SpecialsButton
                specials={specials}
                settings={settings}
                className="btn-o min-h-[52px] w-full px-7 text-[15px] sm:w-auto"
              />
            )}
          </div>
        </div>
      </section>

      {/* ---------- the practical promises ---------- */}
      <Reveal>
        <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-5 border-y border-line py-6 md:mt-16 md:grid-cols-4 md:gap-8 md:py-7">
          {[
            {
              Icon: CalendarCheck,
              title: "Baked to order",
              sub: `Order ${settings.default_lead_time_hours} hours ahead`,
            },
            { Icon: Moped, title: "Delivery", sub: "Across Dubai" },
            {
              Icon: Storefront,
              title: "Free pickup",
              sub: pickup ? `In ${pickup}` : "From our kitchen",
            },
            {
              Icon: ChatCircleDots,
              title: "Personal service",
              sub: `${owner} confirms every order`,
            },
          ].map(({ Icon, title, sub }) => (
            <li key={title} className="flex items-start gap-3">
              <Icon
                size={22}
                className="mt-0.5 shrink-0 text-rose-deep"
                aria-hidden
              />
              <span>
                <span className="block text-[14px] font-semibold text-ink">
                  {title}
                </span>
                <span className="block text-[13px] text-ink/60">{sub}</span>
              </span>
            </li>
          ))}
        </ul>
      </Reveal>

      {/* ---------- this week ---------- */}
      {specials.length > 0 && (
        <Section title="This week’s specials">
          <RevealGroup className="grid gap-3 md:grid-cols-2 md:gap-5">
            {specials.map((s, i) => (
              <div key={s.id} style={{ "--i": i } as React.CSSProperties}>
                <SpecialCard
                  special={s}
                  leadTimeHours={settings.default_lead_time_hours}
                />
              </div>
            ))}
          </RevealGroup>
        </Section>
      )}

      {/* ---------- bestsellers ---------- */}
      <Section title="Bestsellers" link={{ href: "/menu", label: "Full menu" }}>
        {featured.length > 0 ? (
          <HomeBestsellers
            items={featured}
            categories={categories}
            settings={settings}
          />
        ) : (
          <MenuUnavailable
            ownerName={owner}
            whatsappNumber={settings.whatsapp_number}
          />
        )}
      </Section>

      {/* ---------- shop by category ---------- */}
      {shelves.length > 0 && (
        <Section title="Shop by category">
          <RevealGroup className="grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-3 md:gap-x-5 md:gap-y-8">
            {shelves.map(({ cat, count, photo }, i) => (
              <Link
                key={cat.id}
                href={`/menu?cat=${cat.id}`}
                style={{ "--i": i } as React.CSSProperties}
                className="group block"
              >
                <span
                  className={`relative block aspect-[4/3] overflow-hidden rounded-[14px] ${TILE_BG[i % 4]}`}
                >
                  <Photo
                    src={photo ?? categoryArt(cat.name)}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 50vw, 340px"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
                  />
                </span>
                <span className="mt-2.5 flex items-baseline justify-between gap-2 px-0.5">
                  <span className="font-display text-[16px] leading-snug text-ink transition-colors group-hover:text-rose-deep md:text-[18px]">
                    {cat.name}
                  </span>
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
        <RevealGroup className="grid gap-8 md:grid-cols-3 md:gap-10">
          {[
            {
              title: "Choose your treats",
              sub: "Pick a size and flavour, or build your own box.",
            },
            {
              title: "Pick a day",
              sub: `Delivery across Dubai or free pickup. Order ${settings.default_lead_time_hours} hours ahead.`,
            },
            {
              title: "Confirm on WhatsApp",
              sub: `Your order opens in WhatsApp. ${owner} confirms and bakes it fresh.`,
            },
          ].map((step, i) => (
            <div
              key={step.title}
              style={{ "--i": i } as React.CSSProperties}
              className="border-t border-ink/15 pt-5"
            >
              <span className="font-display text-[15px] italic text-rose-deep">
                0{i + 1}
              </span>
              <span className="mt-2 block font-display text-[20px] leading-snug">
                {step.title}
              </span>
              <span className="mt-1.5 block text-[14.5px] leading-relaxed text-ink/65">
                {step.sub}
              </span>
            </div>
          ))}
        </RevealGroup>
      </Section>

      {/* ---------- the baker ---------- */}
      <Reveal>
        <section
          aria-labelledby="hello-title"
          className="bleed mt-16 bg-rose md:mt-24"
        >
          <div className="mx-auto grid max-w-[1080px] items-center gap-8 px-4 py-12 md:grid-cols-2 md:gap-14 md:px-6 md:py-20">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[16px] bg-lav md:aspect-square">
              {settings.about_image_url && (
                <Photo
                  src={settings.about_image_url}
                  alt={`${owner} baking`}
                  fill
                  sizes="(max-width: 768px) 100vw, 520px"
                  className="object-cover"
                />
              )}
            </div>
            <div className="text-center md:text-left">
              <h2
                id="hello-title"
                className="text-[32px] leading-[1.1] md:text-[44px]"
              >
                Meet{" "}
                <em className="font-normal italic text-rose-deep">{owner}</em>
              </h2>
              {settings.about_text && (
                <p className="mx-auto mt-4 max-w-[44ch] font-display text-[18px] italic leading-[1.65] text-ink/75 md:mx-0 md:text-[20px]">
                  {settings.about_text}
                </p>
              )}
              <div className="mt-7 flex justify-center md:justify-start">
                <WhatsAppButton
                  number={settings.whatsapp_number}
                  message={`Hi ${owner}! I found ${settings.business_name} and would love to know more.`}
                  className="btn-wa w-auto px-6"
                >
                  Chat with {owner}
                </WhatsAppButton>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* ---------- custom cakes ---------- */}
      <Reveal>
        <section className="mt-5 flex flex-col items-start gap-5 rounded-[16px] bg-lav px-6 py-9 md:mt-24 md:flex-row md:items-center md:justify-between md:px-12 md:py-12">
          <div>
            <h2 className="text-[26px] leading-tight md:text-[34px]">
              Planning a celebration?
            </h2>
            <p className="mt-1.5 text-[15px] text-ink/65">
              Birthday and occasion cakes, designed with {owner}.
            </p>
          </div>
          <Link href="/custom-cakes" className="btn-p press shrink-0 px-6">
            Enquire about a cake{" "}
            <ArrowRight size={16} weight="bold" aria-hidden />
          </Link>
        </section>
      </Reveal>
    </div>
  );
}

function Section({
  title,
  link,
  children,
}: {
  title: string;
  link?: { href: string; label: string };
  children: React.ReactNode;
}) {
  return (
    <section className="mt-14 md:mt-20">
      <Reveal>
        <div className="mb-5 flex items-baseline justify-between gap-4 md:mb-7">
          <h2 className="text-[27px] leading-tight md:text-[36px]">{title}</h2>
          {link && (
            <Link
              href={link.href}
              className="inline-flex shrink-0 items-center gap-1 text-[14px] font-semibold text-rose-deep underline-offset-4 hover:underline"
            >
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
    telephone: settings.whatsapp_number
      ? `+${settings.whatsapp_number}`
      : undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Dubai",
      addressCountry: "AE",
    },
    servesCuisine: "Desserts",
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
