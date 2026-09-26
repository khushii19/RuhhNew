import Link from "next/link";
import { CartProvider } from "@/components/cart-context";
import { BrandBadge } from "@/components/brand-logo";
import { CartBar } from "@/components/cart-bar";
import { CartPill, DesktopTabs, MobileTabBar } from "@/components/site-nav";
import { InstagramIcon, WhatsAppIcon } from "@/components/icons";
import { waLink } from "@/lib/format";
import type { Settings } from "@/lib/types";

export function SiteShell({ settings, children }: { settings: Settings; children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="flex min-h-[100dvh] flex-col">
        <header className="sticky top-0 z-40 border-b border-line bg-surface/95 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-[1080px] items-center justify-between gap-4 px-4 md:px-6">
            <Link href="/" className="flex min-w-0 items-center gap-3" aria-label={`${settings.business_name} home`}>
              <BrandBadge url={settings.logo_url} size={40} />
              <span className="min-w-0">
                <span className="block font-display text-[21px] leading-none text-ink">{settings.business_name}</span>
                <span className="mt-1 block truncate text-[11px] tracking-[0.04em] text-muted">Baked to perfection · est. 2019</span>
              </span>
            </Link>
            <CartPill />
          </div>
          <DesktopTabs />
        </header>

        {/* Each page sets its own column: 680px for most, 1080px for the menu. */}
        <main className="mx-auto w-full max-w-[1080px] flex-1 px-4 pb-32 pt-5 md:px-6 md:pb-20 md:pt-8">{children}</main>

        <SiteFooter settings={settings} />
        <CartBar />
        <MobileTabBar />
      </div>
    </CartProvider>
  );
}

function SiteFooter({ settings }: { settings: Settings }) {
  const ig = settings.instagram_handle?.replace(/^@/, "");
  const linkCls = "text-[13px] text-ink/75 transition-colors hover:text-rose-deep";
  return (
    <footer className="border-t border-line bg-cream2 pb-24 md:pb-0">
      <div className="mx-auto flex max-w-[680px] flex-col items-center gap-5 px-4 py-10 text-center">
        <div className="flex items-center gap-3">
          <BrandBadge url={settings.logo_url} size={34} />
          <p className="text-[13.5px] text-muted">Home baked with soul in Dubai</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {settings.whatsapp_number && (
            <a
              href={waLink(settings.whatsapp_number, `Hi ${settings.owner_name}!`)}
              target="_blank"
              rel="noopener noreferrer"
              className={`${linkCls} inline-flex items-center gap-1.5`}
            >
              <WhatsAppIcon /> WhatsApp
            </a>
          )}
          {ig && (
            <a href={`https://instagram.com/${ig}`} target="_blank" rel="noopener noreferrer" className={`${linkCls} inline-flex items-center gap-1.5`}>
              <InstagramIcon /> @{ig}
            </a>
          )}
        </div>
        <nav aria-label="More" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <Link href="/custom-cakes" className={linkCls}>Custom cakes</Link>
          <Link href="/reviews" className={linkCls}>Reviews</Link>
          <Link href="/track" className={linkCls}>Track an order</Link>
          <Link href="/terms" className={linkCls}>Terms</Link>
          <Link href="/privacy" className={linkCls}>Privacy</Link>
        </nav>
        <p className="text-[11.5px] text-muted">
          © {new Date().getFullYear()} {settings.business_name}
        </p>
      </div>
    </footer>
  );
}
