import Link from "next/link";
import { CartProvider } from "@/components/cart-context";
import { BrandLogo, Signature } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { CartPill, DesktopNav, MobileTabBar } from "@/components/site-nav";
import { InstagramIcon, WhatsAppIcon } from "@/components/icons";
import { waLink } from "@/lib/format";
import type { Settings } from "@/lib/types";

export function SiteShell({ settings, children }: { settings: Settings; children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="flex min-h-[100dvh] flex-col">
        <p className="bg-ink px-5 py-2 text-center text-[11.5px] tracking-[0.06em] text-cream/85">
          Handmade to order in Dubai
          <span className="mx-2 text-cream/40" aria-hidden>
            ·
          </span>
          Order {settings.default_lead_time_hours} hours ahead
        </p>
        <header className="sticky top-0 z-40 border-b border-line bg-cream/92 backdrop-blur-md">
          {/* Nav, centred logo, cart: the boutique arrangement on desktop.
              Phones keep logo and cart; sections live in the tab bar. */}
          <div className="mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto] items-center px-5 md:h-[84px] md:grid-cols-[1fr_auto_1fr] md:px-8">
            <DesktopNav />
            <Link href="/" className="flex items-center md:justify-self-center" aria-label={`${settings.business_name} home`}>
              <BrandLogo url={settings.logo_url} height={46} />
            </Link>
            <div className="justify-self-end">
              <CartPill />
            </div>
          </div>
        </header>

        {/* Pages own their width: the home and menu use the full container,
            forms and prose pages centre a narrower column. */}
        <main className="mx-auto w-full max-w-6xl flex-1 px-5 pb-16 pt-6 md:px-8 md:pb-24 md:pt-10">{children}</main>

        <SiteFooter settings={settings} />
        <MobileTabBar />
      </div>
    </CartProvider>
  );
}

function SiteFooter({ settings }: { settings: Settings }) {
  const ig = settings.instagram_handle?.replace(/^@/, "");
  const linkCls = "text-[13.5px] text-ink/75 transition-colors hover:text-rose-deep";
  return (
    <footer className="border-t border-line bg-cream2 pb-24 md:pb-0">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-[1.5fr_1fr_1fr_1.3fr] md:px-8 md:py-16">
        <div className="flex items-start gap-4 md:flex-col">
          <Signature size={76} />
          <p className="max-w-[28ch] text-[13.5px] leading-relaxed text-muted">
            Small-batch bakes, made to order by {settings.owner_name} in Dubai.
          </p>
        </div>

        <FooterCol title="Shop">
          <Link href="/menu" className={linkCls}>Menu</Link>
          <Link href="/custom-cakes" className={linkCls}>Custom cakes</Link>
          <Link href="/order" className={linkCls}>Your cart</Link>
        </FooterCol>

        <FooterCol title="Help">
          <Link href="/track" className={linkCls}>Track an order</Link>
          <Link href="/reviews" className={linkCls}>Reviews</Link>
          <Link href="/terms" className={linkCls}>Ordering terms</Link>
          <Link href="/privacy" className={linkCls}>Privacy</Link>
        </FooterCol>

        <FooterCol title="Say hello">
          {settings.whatsapp_number && (
            <a
              href={waLink(settings.whatsapp_number, `Hi ${settings.owner_name}!`)}
              target="_blank"
              rel="noopener noreferrer"
              className={`${linkCls} inline-flex items-center gap-2`}
            >
              <WhatsAppIcon /> WhatsApp
            </a>
          )}
          {ig && (
            <a href={`https://instagram.com/${ig}`} target="_blank" rel="noopener noreferrer" className={`${linkCls} inline-flex items-center gap-2`}>
              <InstagramIcon /> @{ig}
            </a>
          )}
          {settings.pickup_address && <p className="text-[13.5px] text-muted">Pickup from {settings.pickup_address}</p>}
          {!settings.whatsapp_number && !ig && !settings.pickup_address && (
            <p className="text-[13.5px] text-muted">Dubai, United Arab Emirates</p>
          )}
        </FooterCol>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-5 text-[12px] text-muted md:px-8">
          <span>
            © {new Date().getFullYear()} {settings.business_name}. Home baked in Dubai.
          </span>
          <span className="flex items-center gap-4">
            <ThemeToggle />
            <Link href="/admin" className="text-muted/50" aria-label="Admin">
              ·
            </Link>
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      {/* Global h2 styles are unlayered and would beat utilities, so the
          footer's small label face is set inline. */}
      <h2 className="mb-4 text-[12px] uppercase tracking-[0.14em] text-ink" style={{ fontFamily: "var(--font-body)", fontWeight: 700 }}>
        {title}
      </h2>
      <div className="flex flex-col items-start gap-2.5">{children}</div>
    </div>
  );
}
