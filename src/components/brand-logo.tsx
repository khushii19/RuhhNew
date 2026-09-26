import { Heart } from "@phosphor-icons/react/dist/ssr";
import { Photo } from "@/components/photo";

/**
 * The round Ruhh badge: a rose-deep circle with a white line heart, or the
 * logo uploaded in Settings shown inside the same circle.
 */
export function BrandBadge({ url, size = 40 }: { url: string | null; size?: number }) {
  return (
    <span
      className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-rose-deep text-white"
      style={{ width: size, height: size }}
    >
      {url ? (
        <Photo src={url} alt="" fill sizes={`${size}px`} className="object-cover" priority />
      ) : (
        <Heart size={Math.round(size * 0.52)} weight="light" aria-hidden />
      )}
    </span>
  );
}

/** The Ruhh monogram, used on the admin screens. */
export function Monogram({ size = 36 }: { size?: number }) {
  return <Photo src="/brand/ruhh-monogram.svg" alt="Ruhh" width={size} height={size} className="rounded-full bg-cream" />;
}
