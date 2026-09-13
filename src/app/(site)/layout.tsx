import { SiteShell } from "@/components/site-shell";
import { getSettings } from "@/lib/data";

export const revalidate = 60;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return <SiteShell settings={settings}>{children}</SiteShell>;
}
