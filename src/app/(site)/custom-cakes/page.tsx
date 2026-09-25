import type { Metadata } from "next";
import { getSettings } from "@/lib/data";
import { EnquiryForm } from "@/components/enquiry-form";
import { PageHeader } from "@/components/page-header";

export const revalidate = 60;
export const metadata: Metadata = { title: "Custom cakes" };

export default async function CustomCakesPage() {
  const settings = await getSettings();
  return (
    <div className="mx-auto w-full max-w-2xl">
      <PageHeader
        eyebrow="Made to order"
        title={
          <>
            Custom cakes for <em className="font-normal italic text-rose-deep">your moments</em>
          </>
        }
      >
        Birthdays, anniversaries, baby showers, office parties. Tell {settings.owner_name} what you have in mind and you&rsquo;ll get a quote on
        WhatsApp. Custom cakes need at least 48 hours&rsquo; notice.
      </PageHeader>
      <EnquiryForm settings={settings} />
    </div>
  );
}
