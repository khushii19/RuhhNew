import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ruhh — Home bakery, Dubai",
    short_name: "Ruhh",
    description: "Handmade cookies, cheesecakes, tiramisu and tea cakes by Shweta.",
    start_url: "/",
    display: "standalone",
    background_color: "#fbf7f2",
    theme_color: "#9b4b6b",
    icons: [
      
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
