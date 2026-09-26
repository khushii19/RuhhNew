import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-cream p-6 text-center">
      <span className="mb-3 text-[44px]" aria-hidden>
        🧁
      </span>
      <h1 className="text-[26px]">Page not found</h1>
      <p className="mt-2 max-w-[34ch] text-[14.5px] text-muted">That page has been eaten. Let&apos;s get you back to the treats.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2.5">
        <Link href="/" className="btn-p press px-6 py-3 text-[14px] font-semibold">
          Back home
        </Link>
        <Link href="/menu" className="btn-o px-6 py-2.5 text-[14px] font-semibold">
          Browse the menu
        </Link>
      </div>
    </div>
  );
}
