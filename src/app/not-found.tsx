import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-cream p-6 text-center">
      <div className="mb-2 text-[44px]">🧁</div>
      <h1 className="mb-1 text-[20px] font-bold">Page not found</h1>
      <p className="mb-4 text-[13px] text-muted">That page has been eaten. Let&apos;s get you back to the menu.</p>
      <Link href="/" className="btn-p">
        Back home
      </Link>
    </div>
  );
}
