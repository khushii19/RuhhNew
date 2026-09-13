import type { Metadata, Viewport } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { env } from "@/lib/env";

const display = Playfair_Display({ subsets: ["latin"], style: ["normal", "italic"], weight: ["400", "500", "600", "700"], variable: "--font-playfair", display: "swap" });
const body = DM_Sans({ subsets: ["latin"], style: ["normal", "italic"], weight: ["400", "500", "600", "700"], variable: "--font-dm-sans", display: "swap" });

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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf7f2" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1315" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <head>
        <script
          // Applies a saved theme choice before first paint to avoid a flash.
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("ruhh_theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}`,
          }}
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
