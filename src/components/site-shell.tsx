import Link from "next/link";
import { CartProvider } from "@/components/cart-context";
import { BrandLogo, Signature } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { CartPill, NavTabs } from "@/components/site-nav";
import { InstagramIcon } from "@/components/icons";
import type { Settings } from "@/lib/types";

export function SiteShell({ settings, children }: { settings: Settings; children: React.ReactNode }) {
  return (
    <CartProvider>
      <div className="relative mx-auto min-h-screen max-w-[680px] pb-16">
        <nav className="sticky top-0 z-40 flex min-h-[58px] flex-wrap items-center justify-between gap-2 border-b-[1.5px] border-line bg-surface px-4 py-2">
          <Link href="/" className="flex shrink-0 items-center" aria-label={`${settings.business_name} home`}>
            <BrandLogo url={settings.logo_url} height={40} />
          </Link>
          <CartPill />
          <NavTabs />
        </nav>
        <main className="p-5">{children}</main>
        <footer className="mt-6 flex flex-col items-center gap-3 px-5 text-center text-[11px] text-muted">
          <Signature />
          <div className="flex items-center gap-4">
            {settings.instagram_handle && (
              <a
                href={`https://instagram.com/${settings.instagram_handle.replace(/^@/, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-rose-deep"
              >
                <InstagramIcon /> @{settings.instagram_handle.replace(/^@/, "")}
              </a>
            )}
            <Link href="/reviews" className="text-rose-deep">
              Reviews
            </Link>
            <Link href="/privacy" className="text-muted">
              Privacy
            </Link>
            <Link href="/terms" className="text-muted">
              Terms
            </Link>
            <ThemeToggle />
            <Link href="/admin" className="text-muted/50" aria-label="Admin">
              ·
            </Link>
          </div>
          <div>
            © {new Date().getFullYear()} {settings.business_name}. Home baked in Dubai.
          </div>
        </footer>
      </div>
    </CartProvider>
  );
}
