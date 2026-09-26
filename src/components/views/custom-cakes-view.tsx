import { EnquiryForm } from "@/components/enquiry-form";
import { PageHeader } from "@/components/page-header";
import type { Settings } from "@/lib/types";

export function CustomCakesView({ settings }: { settings: Settings }) {
  return (
    <div className="mx-auto w-full max-w-[680px]">
      <PageHeader
        eyebrow="Made to order"
        title="Custom cakes"
      >
        Tell {settings.owner_name} what you have in mind and get a quote on WhatsApp. Please allow at least 48 hours.
      </PageHeader>
      <EnquiryForm settings={settings} />
    </div>
  );
}
