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
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Reveal } from "@/components/reveal";

export const revalidate = 60;

/** Soft grounds that show while a photo loads, cycled so neighbours differ. */
const PASTELS = ["bg-rose", "bg-lav", "bg-sage", "bg-peach"];

const HEADLINE = ["The", "kind", "of", "sweet", "thing", "worth"];
const HEADLINE_EM = ["making", "room", "for."];

/** Left edge of the centred max-w-6xl column, for bands that bleed right. */
const COLUMN_START = "md:pl-[max(2rem,calc((100vw-72rem)/2+2rem))]";

export default async function HomePage() {
  const [settings, specials, items, categories] = await Promise.all([getSettings(), getSpecials(), getMenu(), getCategories()]);
  const first = settings.owner_name;
  const featured = getFeatured(items, 4);
  const cats = categories.filter((c) => items.some((i) => i.category_id === c.id));

  return (
    <>
      {/* ---------- hero: copy in the column, photo bleeding to the edge ---------- */}
      <section className="bleed -mt-6 grid md:-mt-10 md:min-h-[600px] md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:min-h-[660px]">
        <div className="relative order-first aspect-[4/3] overflow-hidden bg-cream2 md:order-last md:aspect-auto">
          <Photo
            src={settings.hero_image_url ?? categoryArt("Cheesecakes")}
            alt={settings.hero_image_url ? `A table of ${settings.business_name} bakes` : ""}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 55vw"
            className="hero-photo object-cover"
          />
        </div>
        <div className={`m-fade-up flex flex-col justify-center px-5 py-10 md:py-16 md:pr-12 ${COLUMN_START}`}>
          <h1 className="words pb-2 text-[42px] leading-[1.06] tracking-[-0.02em] sm:text-[52px] lg:text-[64px]">
            {/* The stagger spans are inline-block, which trims a space inside
                them, so the gaps sit between spans. */}
            {HEADLINE.map((w, i) => (
              <Fragment key={w}>
                <span style={{ "--w": i } as React.CSSProperties}>{w}</span>{" "}
              </Fragment>
            ))}
            <em className="font-normal italic text-rose-deep">
              {HEADLINE_EM.map((w, i) => (
                <Fragment key={w}>
                  <span style={{ "--w": HEADLINE.length + i } as React.CSSProperties}>{w}</span>
                  {i < HEADLINE_EM.length - 1 ? " " : ""}
                </Fragment>
              ))}
            </em>
          </h1>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link href="/menu" className="btn-p press px-7 py-3.5 text-[14.5px] font-semibold">
              Order now <ArrowRight size={16} weight="bold" aria-hidden />
            </Link>
            <Link href="/custom-cakes" className="press inline-flex items-center rounded-full border border-ink/20 px-6 py-3.5 text-[14.5px] font-semibold text-ink transition hover:border-rose-deep hover:text-rose-deep">
              Custom cakes
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- categories ---------- */}
      {cats.length > 0 && (
        <Reveal>
          <section className="pt-16 md:pt-24">
            <SectionHead title="The menu" href="/menu" linkLabel="View all" />
            <div className="m-stagger -mx-5 flex scroll-px-5 snap-x snap-mandatory gap-3.5 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:auto-cols-fr md:grid-flow-col md:gap-5 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
              {cats.map((c, i) => (
                <Link
                  key={c.id}
                  href={`/menu?cat=${c.id}`}
                  style={{ "--i": i } as React.CSSProperties}
                  className="group w-[42vw] max-w-[200px] shrink-0 snap-start md:w-auto md:max-w-none"
                >
                  <div className={`relative aspect-[4/5] overflow-hidden rounded-[14px] ${PASTELS[i % PASTELS.length]}`}>
                    <Photo
                      src={categoryCover(items, c.id) ?? categoryArt(c.name)}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 42vw, 230px"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="mt-3 font-display text-[17px] leading-tight transition-colors group-hover:text-rose-deep md:text-[19px]">{c.name}</div>
                </Link>
              ))}
            </div>
          </section>
        </Reveal>
      )}

      {/* ---------- favourites ---------- */}
      {featured.length > 0 && (
        <Reveal>
          <section className="pt-16 md:pt-24">
            <SectionHead title="Favourites" />
            <div className="m-stagger grid grid-cols-2 gap-x-4 gap-y-9 md:gap-x-6 lg:grid-cols-4">
              {featured.map((m, i) => {
                const cat = categories.find((c) => c.id === m.category_id);
                return (
                  <Link key={m.id} href={`/menu?cat=${m.category_id ?? ""}`} style={{ "--i": i } as React.CSSProperties} className="group">
                    <div className={`relative aspect-[4/5] overflow-hidden rounded-[14px] ${PASTELS[i % PASTELS.length]}`}>
                      <Photo
                        src={m.image_url ?? categoryArt(cat?.name)}
                        alt={m.name}
                        fill
                        sizes="(max-width: 1024px) 50vw, 270px"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      />
                    </div>
                    <div className="mt-3.5 font-display text-[17px] leading-snug transition-colors group-hover:text-rose-deep md:text-[18px]">{m.name}</div>
                    <div className="mt-1 text-[13.5px] text-muted">
                      {itemHasOptions(m) && "From "}
                      {aed(itemMinPrice(m))}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </Reveal>
      )}

      {/* ---------- specials ---------- */}
      {specials.length > 0 && (
        <Reveal>
          <section className="pt-16 md:pt-24">
            <SectionHead title="This week" />
            <div className={`m-stagger grid gap-5 md:gap-6 ${specials.length > 1 ? "lg:grid-cols-2" : "lg:max-w-3xl"}`}>
              {specials.map((s, i) => (
                <div key={s.id} style={{ "--i": i } as React.CSSProperties}>
                  <SpecialCard special={s} leadTimeHours={settings.default_lead_time_hours} />
                </div>
              ))}
            </div>
          </section>
        </Reveal>
      )}

      {/* ---------- a note from the baker ---------- */}
      <section id="about" aria-labelledby="about-title" className="bleed mt-16 scroll-mt-24 bg-cream2 md:mt-24">
        <Reveal>
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:gap-16 md:px-8 md:py-24">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[14px] bg-peach md:aspect-[5/6]">
              {settings.about_image_url ? (
                <Photo src={settings.about_image_url} alt={`${first} baking`} fill sizes="(max-width: 768px) 100vw, 540px" className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Signature size={160} />
                </div>
              )}
            </div>
            <div className="md:max-w-[440px]">
              <h2 id="about-title" className="text-[32px] leading-[1.1] tracking-[-0.01em] md:text-[42px]">
                Hello, I&rsquo;m {first}
              </h2>
              <div className="mt-6">
                <Signature size={92} />
              </div>
              <WhatsAppButton
                number={settings.whatsapp_number}
                message={`Hi ${first}! I found ${settings.business_name} and would love to know more.`}
                className="press mt-6 inline-flex items-center gap-2 rounded-full bg-[#15803d] px-5 py-3 text-[14px] font-semibold text-white transition hover:brightness-110"
              >
                Say hello
              </WhatsAppButton>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------- custom cakes ---------- */}
      <Reveal>
        <section className="mt-16 overflow-hidden rounded-[14px] bg-rose md:mt-24">
          <div className="flex flex-col items-start gap-6 px-6 py-12 md:flex-row md:items-center md:justify-between md:px-14 md:py-14">
            <div>
              <h2 className="text-[30px] leading-[1.1] md:text-[38px]">Planning a celebration?</h2>
            </div>
            <Link href="/custom-cakes" className="btn-p press shrink-0 px-7 py-3.5 text-[14.5px] font-semibold">
              Design a custom cake
            </Link>
          </div>
        </section>
      </Reveal>
    </>
  );
}
