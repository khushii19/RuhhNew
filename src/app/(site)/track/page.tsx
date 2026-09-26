import type { Metadata } from "next";
import { getSettings } from "@/lib/data";
import { TrackView } from "@/components/views/track-view";

export const revalidate = 60;
export const metadata: Metadata = { title: "Track your order" };

export default async function TrackPage() {
  const settings = await getSettings();
  return <TrackView settings={settings} />;
}
