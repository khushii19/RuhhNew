import { Photo } from "@/components/photo";

/**
 * Customer-facing logo. Uses the uploaded logo from Settings when present,
 * otherwise the Ruhh wordmark lockup shipped with the app, in a light or
 * dark variant depending on the active theme.
 */
export function BrandLogo({ url, height = 44 }: { url: string | null; height?: number }) {
  if (url) {
    return <Photo src={url} alt="Ruhh" width={height * 3} height={height} className="w-auto object-contain" style={{ height }} priority />;
  }
  const w = Math.round(height * 3.4);
  return (
    <>
      <Photo src="/brand/ruhh-lockup.svg" alt="Ruhh. Baked to perfection, est. 2019" width={w} height={height} style={{ height, width: "auto" }} className="only-light" priority />
      <Photo src="/brand/ruhh-lockup-dark.svg" alt="Ruhh. Baked to perfection, est. 2019" width={w} height={height} style={{ height, width: "auto" }} className="only-dark" priority />
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
