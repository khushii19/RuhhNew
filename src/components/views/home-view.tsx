import { Fragment } from "react";
import Link from "next/link";
import { Photo } from "@/components/photo";
import { BrandLogo } from "@/components/brand-logo";
import { HomeShop } from "@/components/home-shop";
import { MenuUnavailable } from "@/components/menu-unavailable";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { Reveal } from "@/components/reveal";
import { categoryArt } from "@/lib/category-art";
import { getFeatured } from "@/lib/data";
import { ArrowDown, CalendarBlank, Car, Cookie } from "@phosphor-icons/react/dist/ssr";
import type { Category, MenuItem, Settings, Special } from "@/lib/types";

/** The centred max-w-6xl column, for content inside full-bleed bands. */
const COLUMN = "mx-auto w-full max-w-6xl px-5 md:px-8";

const HEADLINE = ["Treats", "baked", "with", "soul,"];
const HEADLINE_EM = ["just", "for", "you."];

export type HomeData = { settings: Settings; specials: Special[]; items: MenuItem[]; categories: Category[] };

/** The home page body. The route fetches the data; the view only renders it. */
export function HomeView({ settings, specials, items, categories }: HomeData) {
  const first = settings.owner_name;
  // Specials get their own row, so "Bestsellers" shows other bakes.
  const specialNames = new Set(specials.map((s) => s.name.trim().toLowerCase()));
  const featured = getFeatured(
    items.filter((m) => !specialNames.has(m.name.trim().toLowerCase())),
    4,
  );
  const heroSrc = settings.hero_image_url;

  return (
    <>
      {/* ---------- banner ----------
          The sharp photo sits right (on top, in the flow, on phones) so the
          bakes stay uncovered; a blurred copy of it fills the rest of the
          band, and the text sits on that soft area in dark ink over a pastel
          pink wash. Fixed colours: the banner is photo-lit in both themes. */}
      <section className="bleed relative -mt-6 overflow-hidden bg-[#f7d6e0] md:-mt-10 md:h-[80svh] md:max-h-[860px] md:min-h-[600px]">
        {heroSrc && <Photo src={heroSrc} alt="" fill sizes="40vw" className="scale-110 object-cover opacity-80 blur-2xl" />}
        <div className="relative aspect-[5/4] w-full [mask-image:linear-gradient(to_bottom,black_75%,transparent)] md:absolute md:inset-y-0 md:right-0 md:aspect-auto md:h-full md:w-[66%] md:[mask-image:linear-gradient(to_right,transparent,black_30%)]">
          {/* The wrapper drifts on scroll (parallax); the photo keeps its slow Ken Burns. */}
          <div className="hero-parallax absolute inset-0">
            <Photo
              src={heroSrc ?? categoryArt("Cookies")}
              alt={heroSrc ? `Freshly baked ${settings.business_name} cookies` : ""}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 66vw"
              className="hero-photo object-cover"
            />
          </div>
        </div>
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_top,#fbe3ea_0%,#fbe3eaf2_52%,transparent_66%)] md:bg-[linear-gradient(to_right,#fbe3eaf2_0%,#fbe3eab3_32%,transparent_56%)]"
        />

        <div className={`${COLUMN} relative -mt-10 pb-10 md:absolute md:inset-0 md:mt-0 md:flex md:flex-col md:justify-center md:pb-0`}>
          <div className="max-w-[560px] text-[#2c1a1a]">
            <p className="m-fade-up text-[12px] font-semibold uppercase tracking-[0.24em] text-[#9b4b6b]">Ruhh means soul</p>
            <h1 className="words mt-3 pb-1 text-[40px] leading-[1.04] tracking-[-0.02em] text-[#2c1a1a] sm:text-[56px] lg:text-[70px]">
              {/* Word-by-word entrance. The spans are inline-block, which trims a
                  space inside them, so the gaps sit between spans. */}
              {HEADLINE.map((w, i) => (
                <Fragment key={w}>
                  <span style={{ "--w": i } as React.CSSProperties}>{w}</span>{" "}
                </Fragment>
              ))}
              <em className="whitespace-nowrap font-normal italic text-[#9b4b6b]">
                {HEADLINE_EM.map((w, i) => (
                  <Fragment key={w}>
                    <span style={{ "--w": HEADLINE.length + i } as React.CSSProperties}>{w}</span>
                    {i < HEADLINE_EM.length - 1 ? " " : ""}
                  </Fragment>
                ))}
              </em>
            </h1>
            <p className="m-fade-up m-delay-2 mt-3 max-w-[36ch] text-[15.5px] leading-relaxed text-[#5a3a3a] md:mt-4 md:text-[18px]">
              Homemade cookies, cheesecakes &amp; tiramisu from {first}&rsquo;s kitchen in Dubai.
            </p>
            <div className="m-fade-up m-delay-3 mt-7 flex flex-wrap items-center gap-3">
              <a href="#bakes" className="press inline-flex items-center gap-2 rounded-full bg-[#9b4b6b] px-7 py-3.5 text-[14.5px] font-semibold text-white transition hover:brightness-110">
                Order now <ArrowDown size={16} weight="bold" aria-hidden />
              </a>
              <Link
                href="/custom-cakes"
                className="press inline-flex items-center rounded-full border border-[#2c1a1a]/25 bg-white/50 px-6 py-3.5 text-[14.5px] font-semibold text-[#2c1a1a] backdrop-blur-sm transition hover:border-[#9b4b6b] hover:text-[#9b4b6b]"
              >
                Custom cakes
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- the shop ---------- */}
      {items.length > 0 ? (
        <HomeShop items={items} featured={featured} categories={categories} specials={specials} settings={settings} />
      ) : (
        <div className="pt-12 md:pt-16">
          <MenuUnavailable ownerName={first} whatsappNumber={settings.whatsapp_number} />
        </div>
      )}

      {/* ---------- the baker: a pastel pink band ---------- */}
      <section id="about" aria-labelledby="about-title" className="bleed mt-20 scroll-mt-24 bg-rose md:mt-28">
        <div className={`${COLUMN} grid items-center gap-10 py-16 md:grid-cols-2 md:gap-16 md:py-24`}>
          <Reveal>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[22px] bg-peach shadow-[0_30px_60px_-35px_rgba(155,75,107,0.6)] md:aspect-[5/6]">
              {settings.about_image_url && (
                <Photo src={settings.about_image_url} alt={`${first} baking`} fill sizes="(max-width: 768px) 100vw, 540px" className="object-cover" />
              )}
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="md:max-w-[460px]">
              <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-rose-deep">The baker behind Ruhh</p>
              <h2 id="about-title" className="mt-4 text-[36px] leading-[1.08] md:text-[52px]">
                Meet {first}.
              </h2>
              {settings.about_text && <p className="mt-5 font-display text-[19px] italic leading-[1.6] text-ink/80 md:text-[22px]">{settings.about_text}</p>}
              <div className="mt-7 flex flex-wrap items-center gap-6">
                <BrandLogo url={null} height={32} variant="wordmark" />
                <WhatsAppButton
                  number={settings.whatsapp_number}
                  message={`Hi ${first}! I found ${settings.business_name} and would love to know more.`}
                  className="press inline-flex items-center gap-2 rounded-full bg-[#15803d] px-5 py-3 text-[14px] font-semibold text-white transition hover:brightness-110"
                >
                  Message {first}
                </WhatsAppButton>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- ordering, in three facts ---------- */}
      <Reveal>
        <section aria-label="Ordering" className="grid gap-4 pt-12 sm:grid-cols-3 md:pt-16">
          {[
            { Icon: CalendarBlank, text: `Order ${settings.default_lead_time_hours} hours ahead` },
            { Icon: Car, text: settings.pickup_address ? "Delivery or free pickup" : "Delivered across Dubai" },
            { Icon: Cookie, text: "Made in small batches" },
          ].map(({ Icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-[14px] text-ink/85">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose text-rose-deep">
                <Icon size={19} weight="duotone" aria-hidden />
              </span>
              {text}
            </div>
          ))}
        </section>
      </Reveal>

      {/* ---------- custom cakes ---------- */}
      <Reveal>
        <section className="mt-12 overflow-hidden rounded-[18px] bg-rose md:mt-16">
          <div className="flex flex-col items-start gap-6 px-6 py-12 md:flex-row md:items-center md:justify-between md:px-14 md:py-14">
            <h2 className="text-[30px] leading-[1.1] md:text-[38px]">Planning a celebration?</h2>
            <Link href="/custom-cakes" className="btn-p press shrink-0 px-7 py-3.5 text-[14.5px] font-semibold">
              Design a custom cake
            </Link>
          </div>
        </section>
      </Reveal>
    </>
  );
}
