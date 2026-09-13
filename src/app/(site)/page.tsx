import { Photo } from "@/components/photo";
import Link from "next/link";
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
import { InstagramIcon } from "@/components/icons";
import { Basket, Car, Fire, Sparkle } from "@phosphor-icons/react/dist/ssr";
import { Stars } from "@/components/stars";
import { Reveal } from "@/components/reveal";
import { Marquee } from "@/components/marquee";

export const revalidate = 60;

const STEPS = [
  { Icon: Basket, title: "Pick your treats", text: "Choose sizes and mix your own boxes." },
  { Icon: Fire, title: "Baked for your date", text: "Nothing waits on a shelf. Every order is made fresh." },
  { Icon: Car, title: "Delivered or collected", text: "Across Dubai by area, or free pickup." },
];

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
  const cats = categories.filter((c) =>
    items.some((i) => i.category_id === c.id),
  );
  const ig = settings.instagram_handle?.replace(/^@/, "");

  return (
    <>
      {/* ---------- hero ---------- */}
      <section className="m-fade-up relative mb-6 grid items-center gap-7 pt-4 sm:grid-cols-[1.05fr_0.95fr] sm:gap-6 sm:pt-6">
        <div>
          <div className="mb-4 flex items-center gap-2 text-[10.5px] font-bold uppercase tracking-[2.2px] text-peach-deep">
            <Sparkle size={15} weight="fill" aria-hidden="true" />
            Small batches · made to order
          </div>
          <h1 className="words mb-4 pb-1 text-[40px] leading-[1.08] tracking-[-0.015em] sm:text-[44px]">
            <span style={{ "--w": 0 } as React.CSSProperties}>The</span>{" "}
            <span style={{ "--w": 1 } as React.CSSProperties}>kind</span>{" "}
            <span style={{ "--w": 2 } as React.CSSProperties}>of</span>
            <br />
            <span style={{ "--w": 3 } as React.CSSProperties}>sweet</span>{" "}
            <span style={{ "--w": 4 } as React.CSSProperties}>thing</span>
            <br />
            <span style={{ "--w": 5 } as React.CSSProperties}>worth</span>{" "}
            <em className="font-normal italic text-rose-clay">
              <span style={{ "--w": 6 } as React.CSSProperties}>making</span>
              <br />
              <span style={{ "--w": 7 } as React.CSSProperties}>room</span>{" "}
              <span style={{ "--w": 8 } as React.CSSProperties}>for.</span>
            </em>
          </h1>
          <p className="mb-6 max-w-[38ch] text-[14px] leading-[1.7] text-muted">
            Thoughtful bakes for slow weekends, good news and the people you
            want to keep close. Made by hand by {first} in Dubai.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/menu"
              className="btn-p press px-6 py-3 text-[14px] font-semibold"
            >
              Explore the menu <span aria-hidden>→</span>
            </Link>
            <a
              href="#about"
              className="group inline-flex items-center gap-1 border-b border-rose-clay/60 pb-0.5 text-[13.5px] font-bold text-ink transition hover:border-rose-deep"
            >
              Our little story{" "}
              <span
                aria-hidden
                className="transition-transform group-hover:translate-x-0.5"
              >
                ›
              </span>
            </a>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[340px] sm:max-w-none">
          {/* offset outline arch */}
          <div
            aria-hidden
            className="absolute -left-3 -top-3 h-full w-full rounded-t-full rounded-b-[18px] border border-rose-deep/25"
          />
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-full rounded-b-[18px] bg-cream2 shadow-[0_24px_50px_-30px_rgba(44,26,26,0.45)]">
            <Photo
              src={settings.hero_image_url ?? categoryArt("Cheesecakes")}
              alt={
                settings.hero_image_url ? `${settings.business_name} bakes` : ""
              }
              fill
              priority
              sizes="(max-width: 680px) 90vw, 340px"
              className="hero-photo object-cover"
            />
          </div>
          <div className="absolute -bottom-3 -right-2 rotate-[-4deg] rounded-[6px] bg-cream px-3.5 py-2 text-[12.5px] italic text-ink shadow-[0_10px_24px_-14px_rgba(44,26,26,0.5)] sm:-right-4">
            Baked with a little more care
          </div>
        </div>
      </section>

      <Marquee items={cats.map((c) => c.name)} />

      {/* ---------- how it works ---------- */}
      <ol className="m-stagger relative mb-8 grid grid-cols-3 gap-3">
        <div aria-hidden className="absolute left-[16%] right-[16%] top-5 h-px bg-line" />
        {STEPS.map((s, i) => (
          <li key={s.title} style={{ "--i": i } as React.CSSProperties} className="relative flex flex-col items-center text-center">
            <div className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-full border border-line bg-cream text-rose-deep">
              <s.Icon size={20} weight="duotone" aria-hidden="true" />
            </div>
            <div className="font-display text-[14px] leading-tight">{s.title}</div>
            <div className="mt-1 max-w-[16ch] text-[11.5px] leading-snug text-muted">{s.text}</div>
          </li>
        ))}
      </ol>

      {/* ---------- specials ---------- */}
      {specials.length > 0 && (
        <>
          <h2 className="sec-head">This week from the oven</h2>
          <div className="m-stagger mb-6">
            {specials.map((s, i) => (
              <div key={s.id} style={{ "--i": i } as React.CSSProperties}>
                <SpecialCard
                  special={s}
                  leadTimeHours={settings.default_lead_time_hours}
                />
              </div>
            ))}
          </div>
        </>
      )}

      {/* ---------- categories ---------- */}
      {cats.length > 0 && (
        <Reveal>
          <h2 className="sec-head">Shop by category</h2>
          <div className="m-stagger mb-6 flex gap-2.5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {cats.map((c, i) => (
              <Link
                key={c.id}
                href={`/menu?cat=${c.id}`}
                style={{ "--i": i } as React.CSSProperties}
                className="lift group relative h-[120px] w-[140px] shrink-0 overflow-hidden rounded-[14px] bg-cream2"
              >
                <Photo
                  src={categoryCover(items, c.id) ?? categoryArt(c.name)}
                  alt=""
                  fill
                  sizes="140px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2c1a1a]/75 to-transparent" />
                <div className="absolute bottom-2.5 left-3 right-3 text-[12px] font-bold leading-tight text-white">
                  {c.name}
                </div>
              </Link>
            ))}
          </div>
        </Reveal>
      )}

      {/* ---------- bestsellers ---------- */}
      {featured.length > 0 && (
        <Reveal>
          <h2 className="sec-head">Customer favourites</h2>
          <div className="m-stagger mb-6 grid grid-cols-2 gap-3">
            {featured.map((m, i) => {
              const cat = categories.find((c) => c.id === m.category_id);
              return (
                <Link
                  key={m.id}
                  href={`/menu?cat=${m.category_id ?? ""}`}
                  style={{ "--i": i } as React.CSSProperties}
                  className="card lift group overflow-hidden"
                >
                  <div className="relative h-[130px] overflow-hidden bg-cream2">
                    <Photo
                      src={m.image_url ?? categoryArt(cat?.name)}
                      alt={m.name}
                      fill
                      sizes="(max-width: 680px) 50vw, 300px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-3">
                    <div className="text-[12.5px] font-bold leading-tight">
                      {m.name}
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted">
                      {m.description}
                    </div>
                    <div className="mt-1.5 text-[13px] font-bold text-rose-deep">
                      {itemHasOptions(m) && (
                        <small className="font-normal text-muted">from </small>
                      )}
                      {aed(itemMinPrice(m))}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </Reveal>
      )}

      {/* ---------- about ---------- */}
      <Reveal>
        <h2 id="about" className="sec-head scroll-mt-24">
          Say hello to {first}
        </h2>
        <div className="mb-8 grid gap-5 sm:grid-cols-[0.8fr_1.2fr] sm:items-center">
          {settings.about_image_url ? (
            <div className="relative aspect-[4/5] overflow-hidden rounded-[16px] bg-cream2 sm:aspect-[3/4]">
              <Photo src={settings.about_image_url} alt={`${first} baking`} fill sizes="(max-width: 680px) 100vw, 260px" className="object-cover" />
            </div>
          ) : (
            <div className="flex aspect-[4/5] items-center justify-center rounded-[16px] bg-rose text-[40px] text-rose-deep sm:aspect-[3/4]">
              <span className="font-display">{first.slice(0, 1)}</span>
            </div>
          )}
          <div>
            <p className="font-display text-[20px] leading-snug">{first}, baker and founder</p>
            <p className="mt-2 max-w-[42ch] text-[14px] leading-[1.7] text-muted">{settings.about_text}</p>
            <div className="mt-4">
              <WhatsAppButton
                number={settings.whatsapp_number}
                message={`Hi ${first}! I found ${settings.business_name} and would love to know more.`}
                className="inline-flex items-center gap-2 rounded-full bg-[#25d366] px-4 py-2 text-[12.5px] font-semibold text-white"
              >
                Chat on WhatsApp
              </WhatsAppButton>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ---------- reviews ---------- */}
      {reviews.length > 0 && (
        <Reveal>
          <h2 className="sec-head">What customers say</h2>
          <div className="m-stagger mb-6 divide-y divide-line">
            {reviews.map((r, i) => (
              <figure key={r.id} style={{ "--i": i } as React.CSSProperties} className="py-4 first:pt-0">
                <blockquote className="font-display text-[16px] italic leading-snug text-ink">“{r.body}”</blockquote>
                <figcaption className="mt-2 flex items-center justify-between text-[12px] text-muted">
                  <span>{r.customer_name}, Dubai</span>
                  <Stars n={r.rating} />
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="-mt-3 mb-6 text-center">
            <Link
              href="/reviews"
              className="text-[12px] text-rose-deep underline"
            >
              Read all reviews or leave yours
            </Link>
          </div>
        </Reveal>
      )}

      {/* ---------- instagram ---------- */}
      {ig && (
        <Reveal>
          <a
            href={`https://instagram.com/${ig}`}
            target="_blank"
            rel="noopener noreferrer"
            className="lift flex items-center justify-between rounded-[14px] bg-gradient-to-r from-lav to-rose p-4"
          >
            <div>
              <div className="text-[13px] font-bold text-ink">
                Follow along on Instagram
              </div>
              <div className="text-[11px] text-muted">
                New bakes, behind the scenes and this week&apos;s specials
                first.
              </div>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-[12px] font-bold text-rose-deep">
              <InstagramIcon /> @{ig}
            </span>
          </a>
        </Reveal>
      )}
    </>
  );
}
