import { Suspense } from "react";
import { MenuBrowser } from "@/components/menu-browser";
import { PageHeader } from "@/components/page-header";
import type { Category, MenuItem, Settings } from "@/lib/types";

export function MenuView({ items, categories, settings }: { items: MenuItem[]; categories: Category[]; settings: Settings }) {
  return (
    <>
      <PageHeader eyebrow="Baked to order" title="The menu" />
      <Suspense fallback={null}>
        <MenuBrowser items={items} categories={categories} settings={settings} />
      </Suspense>
    </>
  );
}
