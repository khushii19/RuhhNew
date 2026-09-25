import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";

/** Section title with an optional link out, aligned to the title's baseline. */
export function SectionHead({ title, href, linkLabel, id }: { title: string; href?: string; linkLabel?: string; id?: string }) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 md:mb-8">
      <h2 id={id} className="text-[28px] leading-[1.15] tracking-[-0.01em] md:text-[36px]">
        {title}
      </h2>
      {href && linkLabel && (
        <Link href={href} className="group inline-flex shrink-0 items-center gap-1.5 pb-1 text-[13.5px] text-rose-deep md:text-[14px]">
          {linkLabel}
          <ArrowRight size={15} weight="bold" aria-hidden className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
