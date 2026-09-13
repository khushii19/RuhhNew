import type { Metadata } from "next";
import { getSettings } from "@/lib/data";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Privacy" };

export default async function PrivacyPage() {
  const s = await getSettings();
  return (
    <article className="prose-ruhh">
      <h1 className="mb-1 text-[24px]">Privacy notice</h1>
      <p className="mb-5 text-[12px] text-muted">Last updated September 2026</p>
      <h2>What we collect</h2>
      <p>
        When you order, we save your name, WhatsApp number, delivery address, the items you chose, your delivery date and any notes or gift message. Enquiries and reviews save the details you type in.
      </p>
      <h2>Why we use it</h2>
      <p>
        To bake and deliver your order, to confirm it with you on WhatsApp, and, if you opted in, to message you about weekly specials. You can opt out of specials at any time by replying to {s.owner_name} on WhatsApp.
      </p>
      <h2>Where it is kept</h2>
      <p>
        Orders are stored in a database hosted by Supabase and the website runs on Vercel. WhatsApp messages are handled by WhatsApp (Meta). We do not sell your information and we do not share it with anyone except these service providers.
      </p>
      <h2>How long</h2>
      <p>Order records are kept for accounting purposes. Ask us on WhatsApp if you would like your details removed.</p>
      <h2>Contact</h2>
      <p>
        {s.business_name}, Dubai, United Arab Emirates. Reach {s.owner_name} on WhatsApp{s.whatsapp_number ? ` at +${s.whatsapp_number}` : ""}.
      </p>
    </article>
  );
}
