/** Top of an inner page: a small rose line, the title, and an optional sentence. */
export function PageHeader({ eyebrow, title, children }: { eyebrow: string; title: React.ReactNode; children?: React.ReactNode }) {
  return (
    <header className="m-fade-up mb-6 md:mb-8">
      <p className="text-[13px] font-medium text-rose-deep">{eyebrow}</p>
      <h1 className="mt-1.5 text-[34px] leading-[1.1] md:text-[44px]">{title}</h1>
      {children && <p className="mt-2 max-w-[54ch] text-[14.5px] leading-relaxed text-muted">{children}</p>}
    </header>
  );
}
