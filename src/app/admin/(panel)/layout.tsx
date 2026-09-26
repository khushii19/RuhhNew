import Link from "next/link";
import { Monogram } from "@/components/brand-logo";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/auth";

export const metadata = { title: "Admin", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  return (
    <div className="admin-ui min-h-screen bg-cream">
      <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b-[1.5px] border-line bg-surface px-4 py-2.5">
        <Link href="/admin" className="flex items-center gap-2.5">
          <Monogram size={40} />
          <div>
            <div className="text-[15px] font-bold text-rose-deep">Ruhh — Admin</div>
            <div className="text-[10px] text-muted">{session.email}</div>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/" className="btn-o px-3 py-1.5 text-[12px]">
            View site
          </Link>
          <form action="/auth/signout" method="post">
            <button className="rounded-full px-3 py-1.5 text-[12px] text-muted hover:text-rose-deep">Sign out</button>
          </form>
        </div>
      </header>
      <div className="mx-auto flex max-w-[1100px] flex-col gap-4 p-4 md:flex-row">
        <AdminNav />
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
