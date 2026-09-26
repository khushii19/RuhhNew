import { Photo } from "@/components/photo";
import Link from "next/link";
import { getApprovedReviews, getCategories, getFeatured, getMenu, getSettings, getSpecials } from "@/lib/data";
import { availableDates } from "@/lib/availability";
import { categoryArt } from "@/lib/category-art";
import { fmtDate } from "@/lib/format";
import { HomeShop } from "@/components/home-shop";
import { MenuUnavailable } from "@/components/menu-unavailable";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { Reveal } from "@/components/reveal";
import { ArrowDown, CalendarBlank, Car, Star } from "@phosphor-icons/react/dist/ssr";

export const revalidate = 60;

/** The centred max-w-6xl column, for content inside full-bleed bands. */
const COLUMN = "mx-auto w-full max-w-6xl px-5 md:px-8";

export default async function HomePage() {
  const [settings, specials, items, categories, reviews] = await Promise.all([
    getSettings(),
    getSpecials(),
    getMenu(),
    getCategories(),
    getApprovedReviews(200),
  ]);
  const first = settings.owner_name;
  // Specials get their own row, so "Most loved" shows other bakes.
  const specialNames = new Set(specials.map((s) => s.name.trim().toLowerCase()));
  const featured = getFeatured(
    items.filter((m) => !specialNames.has(m.name.trim().toLowerCase())),
    4,
  );
  const rating = reviews.length ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length : 0;
  const nextDate = availableDates(settings.default_lead_time_hours, settings, 14)[0];
  const heroSrc = settings.hero_image_url;

  return (
    <>
      {/* ---------- cinematic banner ----------
          The sharp photo sits right (on top, in the flow, on phones) so the
          bakes stay uncovered; a blurred copy of it fills the rest of the band, and
          the text sits on that soft area in dark ink over a light cream
          wash. Fixed colours: the banner is photo-lit in both themes. */}
      <section className="bleed relative -mt-6 overflow-hidden bg-[#efe6da] md:-mt-10 md:h-[80svh] md:max-h-[860px] md:min-h-[600px]">
        {heroSrc && <Photo src={heroSrc} alt="" fill sizes="40vw" className="scale-110 object-cover opacity-90 blur-2xl" />}
        <div className="relative aspect-[5/4] w-full [mask-image:linear-gradient(to_bottom,black_75%,transparent)] md:absolute md:inset-y-0 md:right-0 md:aspect-auto md:h-full md:w-[66%] md:[mask-image:linear-gradient(to_right,transparent,black_30%)]">
          <Photo
            src={heroSrc ?? categoryArt("Cookies")}
            alt={heroSrc ? `Freshly baked ${settings.business_name} cookies` : ""}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 66vw"
            className="hero-photo object-cover"
          />
        </div>
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(to_top,#fbf7f2_0%,#fbf7f2f2_52%,transparent_66%)] md:bg-[linear-gradient(to_right,#fbf7f2f2_0%,#fbf7f2b3_32%,transparent_56%)]"
        />

        <div className={`${COLUMN} relative -mt-10 pb-10 md:absolute md:inset-0 md:mt-0 md:flex md:flex-col md:justify-center md:pb-0`}>
          <div className="m-fade-up max-w-[560px] text-[#2c1a1a]">
            <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-[#9b4b6b]">Ruhh means soul</p>
            <h1 className="mt-3 pb-1 text-[40px] leading-[1.04] tracking-[-0.02em] text-[#2c1a1a] sm:text-[56px] lg:text-[70px]">
              Treats baked with soul, <em className="whitespace-nowrap font-normal italic text-[#9b4b6b]">just for you.</em>
            </h1>
            <p className="mt-3 max-w-[36ch] text-[15.5px] leading-relaxed text-[#5a3a3a] md:mt-4 md:text-[18px]">
              Homemade cookies, cheesecakes &amp; tiramisu from {first}&rsquo;s kitchen in Dubai.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[14px] text-[#5a3a3a]">
              {nextDate && (
                <span className="flex items-center gap-1.5">
                  <CalendarBlank size={16} aria-hidden />
                  Earliest delivery: <span className="font-semibold text-[#2c1a1a]">{fmtDate(nextDate)}</span>
                </span>
              )}
              {reviews.length > 0 && (
                <Link href="/reviews" className="flex items-center gap-1.5 hover:text-[#9b4b6b]">
                  <Star size={15} weight="fill" className="text-[#e8a870]" aria-hidden />
                  <span className="price font-semibold text-[#2c1a1a]">{rating.toFixed(1)}</span>· {reviews.length}{" "}
                  {reviews.length === 1 ? "review" : "reviews"}
                </Link>
              )}
            </div>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a href="#bakes" className="press inline-flex items-center gap-2 rounded-full bg-[#9b4b6b] px-7 py-3.5 text-[14.5px] font-semibold text-white transition hover:brightness-110">
                Order now <ArrowDown size={16} weight="bold" aria-hidden />
              </a>
              <Link
                href="/custom-cakes"
                className="press inline-flex items-center rounded-full border border-[#2c1a1a]/25 bg-white/40 px-6 py-3.5 text-[14.5px] font-semibold text-[#2c1a1a] backdrop-blur-sm transition hover:border-[#9b4b6b] hover:text-[#9b4b6b]"
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

      {/* ---------- a note from the baker: the cinematic, personal close ---------- */}
      <section id="about" aria-labelledby="about-title" className="bleed relative mt-20 overflow-hidden bg-[#1c1113] md:mt-28">
        {settings.about_image_url && <Photo src={settings.about_image_url} alt={`${first} baking`} fill sizes="100vw" className="object-cover" />}
        <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#1c1113]/90 via-[#1c1113]/45 to-[#1c1113]/10" />
        <Reveal className="relative">
          <div className={`${COLUMN} flex min-h-[560px] flex-col justify-end pb-14 md:min-h-[640px] md:pb-20`}>
            <div className="max-w-[620px] text-white">
              <p className="text-[12px] font-semibold uppercase tracking-[0.24em] text-white/75">The baker behind Ruhh</p>
              <h2 id="about-title" className="mt-4 text-[36px] leading-[1.08] text-white md:text-[52px]">
                Meet {first}.
              </h2>
              {settings.about_text && (
                <p className="mt-5 font-display text-[19px] italic leading-[1.55] text-white/90 md:text-[23px]">{settings.about_text}</p>
              )}
              <div className="mt-7 flex flex-wrap items-center gap-6">
                {/* The dark-theme wordmark is light, so it reads on the photo in both themes. */}
                <Photo src="/brand/ruhh-wordmark-dark.svg" alt="" width={124} height={32} style={{ height: 32, width: "auto" }} />
                <WhatsAppButton
                  number={settings.whatsapp_number}
                  message={`Hi ${first}! I found ${settings.business_name} and would love to know more.`}
                  className="press inline-flex items-center gap-2 rounded-full bg-[#15803d] px-5 py-3 text-[14px] font-semibold text-white transition hover:brightness-110"
                >
                  Message {first}
                </WhatsAppButton>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------- ordering, in three facts ---------- */}
      <section aria-label="Ordering" className="grid gap-4 pt-12 sm:grid-cols-3 md:pt-16">
        {[
          { Icon: CalendarBlank, text: `Order ${settings.default_lead_time_hours} hours ahead`, tint: "bg-lav text-lav-deep" },
          { Icon: Car, text: settings.pickup_address ? "Delivery or free pickup" : "Delivered across Dubai", tint: "bg-sage text-sage-deep" },
          { Icon: Star, text: reviews.length ? `Rated ${rating.toFixed(1)} by customers` : "Made in small batches", tint: "bg-peach text-peach-deep" },
        ].map(({ Icon, text, tint }) => (
          <div key={text} className="flex items-center gap-3 text-[14px] text-ink/85">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tint}`}>
              <Icon size={19} weight="duotone" aria-hidden />
            </span>
            {text}
          </div>
        ))}
      </section>

      {/* ---------- custom cakes ---------- */}
      <Reveal>
        <section className="mt-12 overflow-hidden rounded-[14px] bg-rose md:mt-16">
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
