/** Slow, seamless ticker of category names. Pure CSS; pauses on hover and under reduced motion. */
export function Marquee({ items }: { items: string[] }) {
  if (!items.length) return null;
  const row = [...items, ...items];
  return (
    <div className="marquee -mx-5 mb-6 overflow-hidden border-y border-line bg-surface/60 py-2" aria-hidden="true">
      <div className="marquee-track flex w-max gap-8 pl-8">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-8 whitespace-nowrap text-[11px] uppercase tracking-[2.5px] text-rose-deep/80">
            {t} <span className="text-rose-mid">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
