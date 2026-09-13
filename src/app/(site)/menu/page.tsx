import type { Metadata } from "next";
import { Suspense } from "react";
import { getCategories, getMenu, getSettings } from "@/lib/data";
import { MenuBrowser } from "@/components/menu-browser";
import { Photo } from "@/components/photo";

export const revalidate = 60;
export const metadata: Metadata = { title: "Menu" };

export default async function MenuPage() {
  const [items, cats, settings] = await Promise.all([getMenu(), getCategories(), getSettings()]);
  const banner = settings.hero_image_url ?? items.find((i) => i.image_url)?.image_url ?? null;
  return (
    <>
      {banner && (
        <div className="m-fade-up relative -mx-5 -mt-5 mb-5 h-[150px] overflow-hidden">
          <Photo src={banner} alt="" fill priority sizes="(max-width: 680px) 100vw, 680px" className="hero-photo object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2c1a1a]/80 via-[#2c1a1a]/20 to-transparent" />
          <div className="absolute bottom-4 left-5 right-5 text-white">
            <div className="text-[10px] uppercase tracking-[2px] text-rose">Baked to order</div>
            <h1 className="text-[26px] leading-tight">The menu</h1>
          </div>
        </div>
      )}
      <Suspense fallback={null}>
        <MenuBrowser items={items} categories={cats} settings={settings} />
      </Suspense>
    </>
  );
}
