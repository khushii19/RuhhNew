"use client";

import { useState, useTransition } from "react";
import { importExternalPhotos } from "@/app/admin/actions";

/** Copies externally hosted photos into Supabase storage, a few at a time. */
export function ImportPhotosButton() {
  const [pending, start] = useTransition();
  const [log, setLog] = useState<string>("");

  function run() {
    start(async () => {
      let total = 0;
      let remaining = 1;
      const errs: string[] = [];
      while (remaining > 0) {
        const r = await importExternalPhotos(3);
        total += r.done;
        remaining = r.remaining;
        errs.push(...r.errors);
        setLog(`Imported ${total}${remaining ? `, ${remaining} to go…` : ""}`);
        if (r.done === 0 && r.errors.length) break;
      }
      setLog(errs.length ? `Imported ${total}. Problems: ${errs.join("; ")}` : total ? `Imported ${total} photos into your own storage.` : "All photos are already hosted in-house.");
    });
  }

  return (
    <div>
      <button onClick={run} disabled={pending} className="btn-o w-full py-1.5 text-[12px]">
        {pending ? "Importing…" : "Bring photos in-house"}
      </button>
      <p className="mt-1 text-[11px] text-muted">Copies any photo hosted elsewhere (like the launch set) into your Supabase storage at web size, so the site never depends on another service.</p>
      {log && <p className="mt-1 text-[11px] text-sage-deep">{log}</p>}
    </div>
  );
}
