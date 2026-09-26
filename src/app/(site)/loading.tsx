export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading" className="m-fade-in">
      <div className="skeleton mb-6 h-[260px] rounded-[16px] md:h-[380px]" />
      <div className="mb-8 flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton h-9 w-24 rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="skeleton aspect-[4/5] rounded-[14px]" />
        ))}
      </div>
    </div>
  );
}
