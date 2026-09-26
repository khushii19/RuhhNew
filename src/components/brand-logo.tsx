import { Photo } from "@/components/photo";

/*
 * Ruhh's own marks, in public/brand: the script "Ruhh♡" wordmark and the
 * gold-ringed circle versions of it. A logo uploaded in Settings takes the
 * wordmark's place.
 */

/** The script "Ruhh♡" wordmark, for the header. Width follows the height. */
export function Wordmark({ url, height = 36, priority = false }: { url?: string | null; height?: number; priority?: boolean }) {
  if (url) return <Photo src={url} alt="Ruhh" width={height * 3} height={height} className="w-auto object-contain" style={{ height }} priority={priority} />;
  return <Photo src="/brand/ruhh-wordmark.svg" alt="Ruhh" width={Math.round(height * 2.73)} height={height} style={{ height, width: "auto" }} priority={priority} />;
}

/** The round mark: "Ruhh♡" in a gold ring on cream. */
export function BrandSeal({ size = 88, variant = "icon", className = "" }: { size?: number; variant?: "icon" | "primary"; className?: string }) {
  return (
    <Photo
      src={variant === "primary" ? "/brand/ruhh-primary.svg" : "/brand/ruhh-icon.svg"}
      alt="Ruhh"
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

/** The "R♡" monogram, used on the admin screens. */
export function Monogram({ size = 36 }: { size?: number }) {
  return <Photo src="/brand/ruhh-monogram.svg" alt="Ruhh" width={size} height={size} className="rounded-full bg-cream" />;
}
