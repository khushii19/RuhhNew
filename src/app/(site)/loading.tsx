export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading" className="m-fade-in">
      <div className="skeleton mb-3 h-10 w-64 max-w-full rounded-[10px]" />
      <div className="skeleton mb-10 h-4 w-96 max-w-full" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton aspect-[4/5] rounded-[16px]" />
        ))}
      </div>
    </div>
  );
}
