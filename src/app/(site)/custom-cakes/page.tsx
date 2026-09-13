import type { Metadata } from "next";
import { getSettings } from "@/lib/data";
import { EnquiryForm } from "@/components/enquiry-form";

export const revalidate = 60;
export const metadata: Metadata = { title: "Custom cakes" };

export default async function CustomCakesPage() {
  const settings = await getSettings();
  return (
    <>
      <section className="mb-5 rounded-[16px] border-[1.5px] border-line bg-cream2 p-6 text-center">
        <span className="mb-3 inline-block rounded-full bg-lav px-3 py-1 text-[10px] font-bold uppercase tracking-[2px] text-lav-deep">Made to order</span>
        <h1 className="mb-1.5 text-[24px] leading-tight">
          Custom cakes for <span className="italic text-rose-deep">your moments</span>
        </h1>
        <p className="text-[13px] leading-[1.7] text-muted">
          Birthdays, anniversaries, baby showers, office parties. Tell {settings.owner_name} what you have in mind and she will reply on WhatsApp with a quote.
          Custom cakes need at least 48 hours notice.
        </p>
      </section>
      <EnquiryForm settings={settings} />
    </>
  );
}
