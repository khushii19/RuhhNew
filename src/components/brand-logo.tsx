import { Photo } from "@/components/photo";

/**
 * Customer-facing logo. Uses the uploaded logo from Settings when present,
 * otherwise the Ruhh wordmark lockup shipped with the app, in a light or
 * dark variant depending on the active theme.
 */
export function BrandLogo({ url, height = 44, variant = "lockup" }: { url: string | null; height?: number; variant?: "lockup" | "wordmark" }) {
  if (url) {
    return <Photo src={url} alt="Ruhh" width={height * 3} height={height} className="w-auto object-contain" style={{ height }} priority />;
  }
  // The wordmark drops the "baked to perfection" line, which is unreadable
  // at header size; the full lockup is for larger placements.
  const file = variant === "wordmark" ? "ruhh-wordmark" : "ruhh-lockup";
  const alt = variant === "wordmark" ? "Ruhh" : "Ruhh. Baked to perfection, est. 2019";
  const w = Math.round(height * (variant === "wordmark" ? 3.83 : 3.4));
  return (
    <>
      <Photo src={`/brand/${file}.svg`} alt={alt} width={w} height={height} style={{ height, width: "auto" }} className="only-light" priority />
      <Photo src={`/brand/${file}-dark.svg`} alt={alt} width={w} height={height} style={{ height, width: "auto" }} className="only-dark" priority />
    </>
  );
}

export function Monogram({ size = 36 }: { size?: number }) {
  return (
    <>
      <Photo src="/brand/ruhh-monogram.svg" alt="Ruhh" width={size} height={size} className="only-light rounded-full bg-cream" />
      <Photo src="/brand/ruhh-monogram-dark.svg" alt="Ruhh" width={size} height={size} className="only-dark rounded-full bg-cream" />
    </>
  );
}

export function Signature({ size = 96 }: { size?: number }) {
  return (
    <>
      <Photo src="/brand/ruhh-primary.svg" alt="" width={size} height={size} className="only-light opacity-90" style={{ width: size, height: size }} />
      <Photo src="/brand/ruhh-primary-dark.svg" alt="" width={size} height={size} className="only-dark opacity-90" style={{ width: size, height: size }} />
    </>
  );
}
