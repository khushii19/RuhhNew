/** Top of an inner page: spaced eyebrow, serif title, optional one-liner. */
export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: React.ReactNode; children?: React.ReactNode }) {
  return (
    <header className="m-fade-up mb-9 md:mb-12">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-rose-clay">{eyebrow}</p>
      <h1 className="text-[38px] leading-[1.05] tracking-[-0.02em] md:text-[52px]">{title}</h1>
      {children && <p className="mt-4 max-w-[54ch] text-[15.5px] leading-relaxed text-muted md:text-[16.5px]">{children}</p>}
    </header>
  );
}
