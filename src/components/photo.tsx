import Image, { type ImageProps } from "next/image";

/**
 * next/image with the right optimisation mode: remote photos go through the
 * optimiser (resized, WebP/AVIF, cached); inline SVG data URLs are served as-is.
 */
export function Photo(props: ImageProps) {
  const src = typeof props.src === "string" ? props.src : "";
  return <Image {...props} alt={props.alt} unoptimized={src.startsWith("data:") || src.endsWith(".svg")} />;
}
