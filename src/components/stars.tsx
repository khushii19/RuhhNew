export function Stars({ n }: { n: number }) {
  return (
    <span className="text-[12px] tracking-[1px] text-peach-mid" aria-label={`${n} out of 5 stars`}>
      {"★".repeat(n)}
      <span className="text-line">{"★".repeat(5 - n)}</span>
    </span>
  );
}
