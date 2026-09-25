import { Photo } from "@/components/photo";
import Link from "next/link";
import { Fragment } from "react";
import {
  categoryCover,
  getApprovedReviews,
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
import { Stars } from "@/components/stars";
import { Reveal } from "@/components/reveal";

export const revalidate = 60;

const STEPS = [
  { Icon: Basket, title: "Pick your treats", text: "Choose sizes and mix your own boxes." },
  { Icon: Fire, title: "Baked for your date", text: "Nothing waits on a shelf. Every order is made fresh." },
  { Icon: Car, title: "Delivered or collected", text: "Across Dubai by area, or free pickup." },
];

const HEADLINE = ["The", "kind", "of", "sweet", "thing", "worth"];
const HEADLINE_EM = ["making", "room", "for."];

export default async function HomePage() {
  const [settings, specials, reviews, items, categories] = await Promise.all([
    getSettings(),
    getSpecials(),
    getApprovedReviews(3),
    getMenu(),
    getCategories(),
  ]);
  const first = settings.owner_name;
  const featured = getFeatured(items, 4);
  const cats = categories.filter((c) => items.some((i) => i.category_id === c.id));
  const [lead, ...moreReviews] = reviews;

  return (
    <>
      {/* ---------- hero ---------- */}
      <section className="m-fade-up grid items-center gap-10 pb-14 md:grid-cols-[1.1fr_0.9fr] md:gap-14 md:pb-20 md:pt-2">
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
          <p className="mt-5 max-w-[44ch] text-[16px] leading-relaxed text-muted md:text-[17px]">
            Thoughtful bakes for slow weekends, good news and the people you keep close. Made by hand by {first} in Dubai.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <Link href="/menu" className="btn-p press px-7 py-3.5 text-[15px] font-semibold">
              Explore the menu <ArrowRight size={16} weight="bold" aria-hidden />
            </Link>
            <a
              href="#about"
              className="border-b border-rose-clay/60 pb-0.5 text-[14.5px] font-semibold text-ink transition hover:border-rose-deep hover:text-rose-deep"
            >
              Our story
            </a>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[360px] md:ml-auto md:mr-0 md:max-w-[440px]">
          <div aria-hidden className="absolute -left-3 -top-3 h-full w-full rounded-t-full rounded-b-[16px] border border-rose-deep/25" />
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
      <section aria-label="How ordering works" className="bleed border-y border-line bg-surface">
        <ol className="mx-auto grid max-w-6xl gap-6 px-5 py-8 md:grid-cols-3 md:gap-0 md:divide-x md:divide-line md:px-8 md:py-10">
          {STEPS.map((s) => (
            <li key={s.title} className="flex items-start gap-4 md:px-8 md:first:pl-0 md:last:pr-0">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-rose text-rose-deep">
                <s.Icon size={21} weight="duotone" aria-hidden />
              </span>
              <span>
                <span className="font-display block text-[17px] leading-tight">{s.title}</span>
                <span className="mt-1 block text-[13.5px] leading-snug text-muted">{s.text}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- categories ---------- */}
      {cats.length > 0 && (
        <Reveal>
          <section className="pt-16 md:pt-24">
            <SectionHead title="Shop by category" href="/menu" linkLabel="See the full menu" />
            <div className="m-stagger -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:auto-cols-fr md:grid-flow-col md:gap-4 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
              {cats.map((c, i) => {
                const count = items.filter((m) => m.category_id === c.id).length;
                return (
                  <Link
                    key={c.id}
                    href={`/menu?cat=${c.id}`}
                    style={{ "--i": i } as React.CSSProperties}
                    className="lift group relative aspect-[3/4] w-[44vw] max-w-[210px] shrink-0 snap-start overflow-hidden rounded-[16px] bg-rose md:w-auto md:max-w-none"
                  >
                    <Photo
                      src={categoryCover(items, c.id) ?? categoryArt(c.name)}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 44vw, 220px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2c1a1a]/75 via-[#2c1a1a]/10 to-transparent" />
                    <div className="absolute inset-x-4 bottom-4 text-white">
                      <div className="font-display text-[18px] leading-tight">{c.name}</div>
                      <div className="mt-0.5 text-[12px] text-white/80">
                        {count} {count === 1 ? "bake" : "bakes"}
                      </div>
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
            <SectionHead title="This week from the oven" />
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
            <SectionHead title="Customer favourites" />
            <div className="m-stagger grid grid-cols-2 gap-x-4 gap-y-8 md:gap-x-6 lg:grid-cols-4">
              {featured.map((m, i) => {
                const cat = categories.find((c) => c.id === m.category_id);
                return (
                  <Link key={m.id} href={`/menu?cat=${m.category_id ?? ""}`} style={{ "--i": i } as React.CSSProperties} className="group">
                    <div className="relative aspect-square overflow-hidden rounded-[16px] bg-rose">
                      <Photo
                        src={m.image_url ?? categoryArt(cat?.name)}
                        alt={m.name}
                        fill
                        sizes="(max-width: 1024px) 50vw, 270px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="mt-3 text-[15px] font-semibold leading-snug transition-colors group-hover:text-rose-deep">{m.name}</div>
                    <div className="mt-0.5 line-clamp-1 text-[13px] text-muted">{m.description}</div>
                    <div className="mt-1.5 text-[14px] font-semibold text-rose-deep">
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
      <section id="about" aria-labelledby="about-title" className="bleed mt-16 scroll-mt-20 bg-cream2 md:mt-24">
        <Reveal>
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-[0.85fr_1.15fr] md:gap-16 md:px-8 md:py-24">
            <div className="relative mx-auto aspect-[4/5] w-full max-w-[420px] overflow-hidden rounded-[16px] bg-rose md:mx-0">
              {settings.about_image_url ? (
                <Photo src={settings.about_image_url} alt={`${first} baking`} fill sizes="(max-width: 768px) 90vw, 420px" className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Signature size={160} />
                </div>
              )}
            </div>
            <div>
              <h2 id="about-title" className="text-[32px] leading-[1.15] tracking-[-0.01em] md:text-[42px]">
                Say hello to {first}
              </h2>
              <p className="mt-2 text-[15px] italic text-rose-clay">Baker and founder</p>
              <p className="mt-5 max-w-[48ch] text-[16px] leading-relaxed text-muted">{settings.about_text}</p>
              <div className="mt-7">
                <WhatsAppButton
                  number={settings.whatsapp_number}
                  message={`Hi ${first}! I found ${settings.business_name} and would love to know more.`}
                  className="press inline-flex items-center gap-2 rounded-full bg-[#15803d] px-5 py-3 text-[14px] font-semibold text-white transition hover:brightness-110"
                >
                  Chat on WhatsApp
                </WhatsAppButton>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------- reviews ---------- */}
      {lead && (
        <Reveal>
          <section className="pt-16 md:pt-24">
            <SectionHead title="What customers say" href="/reviews" linkLabel="All reviews" />
            <div className={`grid gap-10 ${moreReviews.length ? "md:grid-cols-[1.35fr_1fr] md:gap-14" : ""}`}>
              <figure>
                <blockquote className="font-display text-[24px] italic leading-snug text-ink md:text-[32px]">&ldquo;{lead.body}&rdquo;</blockquote>
                <figcaption className="mt-5 flex items-center gap-3 text-[14px] text-muted">
                  <Stars n={lead.rating} />
                  <span>{lead.customer_name}, Dubai</span>
                </figcaption>
              </figure>
              {moreReviews.length > 0 && (
                <div className="flex flex-col divide-y divide-line md:border-l md:border-line md:pl-14">
                  {moreReviews.map((r) => (
                    <figure key={r.id} className="py-5 first:pt-0 last:pb-0">
                      <blockquote className="text-[15px] leading-relaxed text-ink">&ldquo;{r.body}&rdquo;</blockquote>
                      <figcaption className="mt-2.5 flex items-center gap-3 text-[13px] text-muted">
                        <Stars n={r.rating} />
                        <span>{r.customer_name}</span>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              )}
            </div>
          </section>
        </Reveal>
      )}

      {/* ---------- custom cakes ---------- */}
      <Reveal>
        <section className="mt-16 rounded-[16px] bg-rose px-6 py-12 text-center md:mt-24 md:px-12 md:py-16">
          <h2 className="text-[28px] leading-[1.15] md:text-[36px]">Planning a celebration?</h2>
          <p className="mx-auto mt-3 max-w-[46ch] text-[15px] leading-relaxed text-ink/70">
            Birthdays, anniversaries, office parties. Tell {first} the idea and she will send a quote on WhatsApp.
          </p>
          <Link href="/custom-cakes" className="btn-p press mt-7 px-7 py-3.5 text-[15px] font-semibold">
            Plan a custom cake
          </Link>
        </section>
      </Reveal>
    </>
  );
}
