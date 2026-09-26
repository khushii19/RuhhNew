"use client"; // Error boundaries must be Client Components

import Link from "next/link";
import { useEffect } from "react";
import { Cookie } from "@phosphor-icons/react";

export default function SiteError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-[680px] rounded-[16px] border-[1.5px] border-dashed border-rose-mid/60 bg-surface px-6 py-14 text-center">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose text-rose-deep">
        <Cookie size={30} aria-hidden />
      </span>
      <h1 className="mt-4 text-[26px]">Something went wrong</h1>
      <p className="mx-auto mt-2 max-w-[38ch] text-[14.5px] text-muted">A crumb got stuck. Please try again; your basket is safe.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-2.5">
        <button type="button" onClick={() => retry()} className="btn-p press px-6 py-3 text-[14px] font-semibold">
          Try again
        </button>
        <Link href="/" className="btn-o px-6 py-2.5 text-[14px] font-semibold">
          Back home
        </Link>
      </div>
    </div>
  );
}
