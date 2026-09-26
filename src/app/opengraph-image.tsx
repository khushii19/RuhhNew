import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Link-preview card for WhatsApp, Instagram and the rest. Built only from
// local brand assets so the build never depends on a remote image host.
export const alt = "Ruhh, a home bakery in Dubai";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const wordmark = await readFile(join(process.cwd(), "public/brand/ruhh-wordmark.svg"), "utf8");
  const src = `data:image/svg+xml;base64,${Buffer.from(wordmark).toString("base64")}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#fbf7f2",
          border: "18px solid #f7d6e0",
        }}
      >
        <img src={src} height={210} alt="" />
        <div style={{ marginTop: 36, fontSize: 34, letterSpacing: 6, color: "#9b4b6b", textTransform: "uppercase" }}>Home bakery · Dubai</div>
        <div style={{ marginTop: 16, fontSize: 28, color: "#7a5050" }}>Handmade to order</div>
      </div>
    ),
    size,
  );
}
