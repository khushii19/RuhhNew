import type { Metadata, Viewport } from "next";
import { Lora } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { env } from "@/lib/env";

// One warm serif for the whole storefront, like the first build's Georgia.
const lora = Lora({ subsets: ["latin"], style: ["normal", "italic"], weight: ["400", "500", "600", "700"], variable: "--font-lora", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: { default: "Ruhh — Home bakery in Dubai, by Shweta", template: "%s · Ruhh" },
  description:
    "Handmade cookies, cheesecakes, tiramisu and tea cakes, baked slowly and from the heart by Shweta in Dubai. Order for delivery or pickup.",
  manifest: "/manifest.webmanifest",
  openGraph: {
    title: "Ruhh — Baked to perfection",
    description: "Home-baked treats with soul, delivered across Dubai.",
    type: "website",
    locale: "en_AE",
  },
  appleWebApp: { capable: true, title: "Ruhh", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  // Light only, so phones in dark mode still get the cream app.
  themeColor: "#fbf7f2",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={lora.variable}>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
