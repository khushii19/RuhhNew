import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

/**
 * Section title: a small spaced eyebrow over a serif heading, with an
 * optional link out aligned to the heading's baseline.
 */
export function SectionHead({
  title,
  eyebrow,
  href,
  linkLabel,
  id,
}: {
  title: string;
  eyebrow?: string;
  href?: string;
  linkLabel?: string;
  id?: string;
}) {
  return (
    <div className="mb-7 flex items-end justify-between gap-4 md:mb-10">
      <div>
        {eyebrow && <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-rose-deep">{eyebrow}</p>}
        <h2 id={id} className="text-[30px] leading-[1.1] tracking-[-0.01em] md:text-[40px]">
          {title}
        </h2>
      </div>
      {href && linkLabel && (
        <Link href={href} className="group inline-flex shrink-0 items-center gap-1.5 pb-1.5 text-[13.5px] font-medium text-ink/80 transition-colors hover:text-rose-deep">
          {linkLabel}
          <ArrowRight size={15} aria-hidden className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
