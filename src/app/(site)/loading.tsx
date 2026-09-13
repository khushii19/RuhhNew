export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading" className="m-fade-in">
      <div className="skeleton mb-5 h-[260px] w-full rounded-[16px]" />
      <div className="skeleton mb-3 h-3 w-40" />
      <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton h-[200px] rounded-[16px]" />
        ))}
      </div>
    </div>
  );
}
