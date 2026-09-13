import type { Metadata } from "next";
import { getSettings } from "@/lib/data";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Terms" };

export default async function TermsPage() {
  const s = await getSettings();
  return (
    <article className="prose-ruhh">
      <h1 className="mb-1 text-[24px]">Ordering terms</h1>
      <p className="mb-5 text-[12px] text-muted">Last updated September 2026</p>
      <h2>Orders</h2>
      <p>
        An order is confirmed once {s.owner_name} replies on WhatsApp. Everything is baked to order, so each item needs the notice shown at checkout. We may decline or reschedule an order if a date is full.
      </p>
      <h2>Payment</h2>
      <p>Pay by cash on delivery or pickup, or by bank transfer before your slot. Prices are in AED{s.tax_note ? ` (${s.tax_note})` : ""}.</p>
      <h2>Delivery and pickup</h2>
      <p>
        Delivery fees depend on your area and are shown at checkout. Please make sure someone is available during the chosen slot. Pickup is free from our location in Dubai, shared on confirmation.
      </p>
      <h2>Changes and cancellations</h2>
      <p>Message us on WhatsApp as early as possible. Once baking has started an order cannot be cancelled or refunded.</p>
      <h2>Allergens</h2>
      <p>Our kitchen handles nuts, dairy, eggs, gluten and soy. Tell us about allergies in the notes and we will advise, but we cannot guarantee any item is free of traces.</p>
      <h2>Contact</h2>
      <p>
        {s.business_name}, Dubai, United Arab Emirates{s.whatsapp_number ? ` · WhatsApp +${s.whatsapp_number}` : ""}.
      </p>
    </article>
  );
}
