import type { Metadata } from "next";
import { Suspense } from "react";
import { getCategories, getMenu, getSettings } from "@/lib/data";
import { MenuBrowser } from "@/components/menu-browser";

export const revalidate = 60;
export const metadata: Metadata = { title: "Menu" };

export default async function MenuPage() {
  const [items, cats, settings] = await Promise.all([getMenu(), getCategories(), getSettings()]);
  return (
    <>
      <header className="m-fade-up mb-8 md:mb-12">
        <h1 className="text-[36px] leading-[1.1] tracking-[-0.015em] md:text-[48px]">The menu</h1>
        <p className="mt-3 max-w-[52ch] text-[15px] leading-relaxed text-muted md:text-[16px]">
          Pick a treat and a size. Everything is baked fresh for the date you choose.
        </p>
      </header>
      <Suspense fallback={null}>
        <MenuBrowser items={items} categories={cats} settings={settings} />
      </Suspense>
    </>
  );
}
