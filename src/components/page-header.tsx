/** Top of an inner page: a small pastel pill, the title, and an optional line. */
export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: React.ReactNode; children?: React.ReactNode }) {
  return (
    <header className="m-fade-up mb-6 md:mb-8">
      <span className="inline-block rounded-full bg-rose px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.18em] text-rose-deep">{eyebrow}</span>
      <h1 className="mt-3 text-[30px] leading-[1.12] md:text-[36px]">{title}</h1>
      {children && <p className="mt-2 max-w-[54ch] text-[14.5px] leading-relaxed text-muted">{children}</p>}
    </header>
  );
}
