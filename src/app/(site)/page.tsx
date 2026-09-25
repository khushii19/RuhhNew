import { Photo } from "@/components/photo";
import Link from "next/link";
import { Fragment } from "react";
import {
  categoryCover,
  getCategories,
  getFeatured,
  getMenu,
  getSettings,
  getSpecials,
  itemHasOptions,
  itemMinPrice,
} from "@/lib/data";
import { categoryArt } from "@/lib/category-art";
import { aed } from "@/lib/format";
import { SpecialCard } from "@/components/special-card";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { Signature } from "@/components/brand-logo";
import { SectionHead } from "@/components/section-head";
import { ArrowRight, Basket, Car, Fire } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/reveal";

export const revalidate = 60;

const STEPS = [
  { Icon: Basket, title: "Pick your treats", tint: "bg-lav text-lav-deep" },
  { Icon: Fire, title: "Baked for your date", tint: "bg-peach text-peach-deep" },
  { Icon: Car, title: "Delivered or collected", tint: "bg-sage text-sage-deep" },
];

/** The pastel grounds, cycled so neighbouring tiles never match. */
const PASTELS = ["bg-rose", "bg-lav", "bg-sage", "bg-peach"];

const HEADLINE = ["The", "kind", "of", "sweet", "thing", "worth"];
const HEADLINE_EM = ["making", "room", "for."];

export default async function HomePage() {
  const [settings, specials, items, categories] = await Promise.all([getSettings(), getSpecials(), getMenu(), getCategories()]);
  const first = settings.owner_name;
  const featured = getFeatured(items, 4);
  const cats = categories.filter((c) => items.some((i) => i.category_id === c.id));

  return (
    <>
      {/* ---------- hero ---------- */}
      <section className="m-fade-up grid items-center gap-10 pb-12 md:grid-cols-[1.1fr_0.9fr] md:gap-14 md:pb-16 md:pt-2">
        <div>
          <h1 className="words pb-2 text-[40px] leading-[1.1] tracking-[-0.015em] sm:text-[50px] lg:text-[60px]">
            {/* The stagger spans are inline-block, which trims a space inside
                them, so the gaps sit between spans. */}
            {HEADLINE.map((w, i) => (
              <Fragment key={w}>
                <span style={{ "--w": i } as React.CSSProperties}>{w}</span>{" "}
              </Fragment>
            ))}
            <em className="font-normal italic text-rose-clay">
              {HEADLINE_EM.map((w, i) => (
                <Fragment key={w}>
                  <span style={{ "--w": HEADLINE.length + i } as React.CSSProperties}>{w}</span>
                  {i < HEADLINE_EM.length - 1 ? " " : ""}
                </Fragment>
              ))}
            </em>
          </h1>
          <p className="mt-4 text-[16px] text-muted md:text-[17px]">Handmade in Dubai by {first}.</p>
          <Link href="/menu" className="btn-p press mt-8 px-7 py-3.5 text-[15px] font-semibold">
            Explore the menu <ArrowRight size={16} weight="bold" aria-hidden />
          </Link>
        </div>

        <div className="relative mx-auto w-full max-w-[360px] md:ml-auto md:mr-0 md:max-w-[440px]">
          <div aria-hidden className="absolute -left-4 -top-4 h-full w-full rounded-t-full rounded-b-[16px] bg-lav" />
          <div aria-hidden className="absolute -bottom-5 -right-5 h-28 w-28 rounded-full bg-peach md:h-36 md:w-36" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-full rounded-b-[16px] bg-rose shadow-[0_28px_60px_-34px_rgba(44,26,26,0.5)]">
            <Photo
              src={settings.hero_image_url ?? categoryArt("Cheesecakes")}
              alt={settings.hero_image_url ? `${settings.business_name} bakes` : ""}
              fill
              priority
              sizes="(max-width: 768px) 90vw, 440px"
              className="hero-photo object-cover"
            />
          </div>
        </div>
      </section>

      {/* ---------- how it works ---------- */}
      <section aria-label="How ordering works">
        <ol className="flex flex-wrap gap-2.5 md:gap-3">
          {STEPS.map((s, i) => (
            <li key={s.title} className={`flex items-center gap-2.5 rounded-full py-2 pl-2 pr-4 text-[14px] font-semibold ${s.tint}`}>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface/70 text-[12px]">{i + 1}</span>
              <s.Icon size={18} weight="duotone" aria-hidden />
              {s.title}
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- categories ---------- */}
      {cats.length > 0 && (
        <Reveal>
          <section className="pt-16 md:pt-24">
            <SectionHead title="Shop by category" href="/menu" linkLabel="Full menu" />
            <div className="m-stagger -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:auto-cols-fr md:grid-flow-col md:gap-4 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
              {cats.map((c, i) => (
                <Link
                  key={c.id}
                  href={`/menu?cat=${c.id}`}
                  style={{ "--i": i } as React.CSSProperties}
                  className={`lift group w-[40vw] max-w-[200px] shrink-0 snap-start rounded-[16px] p-2 pb-3 md:w-auto md:max-w-none ${PASTELS[i % PASTELS.length]}`}
                >
                  <div className="relative aspect-square overflow-hidden rounded-[12px]">
                    <Photo
                      src={categoryCover(items, c.id) ?? categoryArt(c.name)}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 40vw, 200px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="mt-2.5 px-1 text-center text-[14px] font-semibold leading-tight text-ink">{c.name}</div>
                </Link>
              ))}
            </div>
          </section>
        </Reveal>
      )}

      {/* ---------- specials ---------- */}
      {specials.length > 0 && (
        <Reveal>
          <section className="pt-16 md:pt-24">
            <SectionHead title="This week" />
            <div className={`m-stagger grid gap-4 md:gap-6 ${specials.length > 1 ? "lg:grid-cols-2" : "lg:max-w-3xl"}`}>
              {specials.map((s, i) => (
                <div key={s.id} style={{ "--i": i } as React.CSSProperties}>
                  <SpecialCard special={s} leadTimeHours={settings.default_lead_time_hours} />
                </div>
              ))}
            </div>
          </section>
        </Reveal>
      )}

      {/* ---------- favourites ---------- */}
      {featured.length > 0 && (
        <Reveal>
          <section className="pt-16 md:pt-24">
            <SectionHead title="Favourites" href="/menu" linkLabel="See all" />
            <div className="m-stagger grid grid-cols-2 gap-x-4 gap-y-7 md:gap-x-6 lg:grid-cols-4">
              {featured.map((m, i) => {
                const cat = categories.find((c) => c.id === m.category_id);
                return (
                  <Link key={m.id} href={`/menu?cat=${m.category_id ?? ""}`} style={{ "--i": i } as React.CSSProperties} className="group">
                    <div className={`relative aspect-square overflow-hidden rounded-[16px] ${PASTELS[i % PASTELS.length]}`}>
                      <Photo
                        src={m.image_url ?? categoryArt(cat?.name)}
                        alt={m.name}
                        fill
                        sizes="(max-width: 1024px) 50vw, 270px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="mt-3 text-[15px] font-semibold leading-snug transition-colors group-hover:text-rose-deep">{m.name}</div>
                    <div className="mt-1 text-[14px] font-semibold text-rose-deep">
                      {itemHasOptions(m) && <span className="font-normal text-muted">from </span>}
                      {aed(itemMinPrice(m))}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </Reveal>
      )}

      {/* ---------- about ---------- */}
      <section id="about" aria-labelledby="about-title" className="bleed mt-16 scroll-mt-20 bg-sage/60 md:mt-24">
        <Reveal>
          <div className="mx-auto grid max-w-6xl items-center gap-8 px-5 py-14 md:grid-cols-[0.8fr_1.2fr] md:gap-16 md:px-8 md:py-20">
            <div className="relative mx-auto aspect-square w-full max-w-[340px] overflow-hidden rounded-full bg-peach md:mx-0">
              {settings.about_image_url ? (
                <Photo src={settings.about_image_url} alt={`${first} baking`} fill sizes="(max-width: 768px) 80vw, 340px" className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Signature size={140} />
                </div>
              )}
            </div>
            <div className="text-center md:text-left">
              <h2 id="about-title" className="text-[32px] leading-[1.15] tracking-[-0.01em] md:text-[42px]">
                Say hello to {first}
              </h2>
              <p className="mx-auto mt-4 max-w-[42ch] text-[16px] leading-relaxed text-muted md:mx-0">{settings.about_text}</p>
              <WhatsAppButton
                number={settings.whatsapp_number}
                message={`Hi ${first}! I found ${settings.business_name} and would love to know more.`}
                className="press mt-6 inline-flex items-center gap-2 rounded-full bg-[#15803d] px-5 py-3 text-[14px] font-semibold text-white transition hover:brightness-110"
              >
                Chat on WhatsApp
              </WhatsAppButton>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------- custom cakes ---------- */}
      <Reveal>
        <section className="mt-16 flex flex-col items-center gap-6 rounded-[16px] bg-gradient-to-r from-lav via-rose to-peach px-6 py-12 text-center md:mt-24 md:flex-row md:justify-between md:px-12 md:text-left">
          <h2 className="text-[28px] leading-[1.15] md:text-[36px]">Planning a celebration?</h2>
          <Link href="/custom-cakes" className="btn-p press shrink-0 px-7 py-3.5 text-[15px] font-semibold">
            Plan a custom cake
          </Link>
        </section>
      </Reveal>
    </>
  );
}
