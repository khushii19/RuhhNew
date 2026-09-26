import { Cookie } from "@phosphor-icons/react/dist/ssr";
import { WhatsAppButton } from "@/components/whatsapp-button";

/**
 * Shown in place of products when the menu comes back empty (the database
 * is unreachable or nothing is listed yet), so the page reads as paused
 * rather than broken, and still offers a way to order.
 */
export function MenuUnavailable({ ownerName, whatsappNumber }: { ownerName: string; whatsappNumber: string }) {
  return (
    <div className="rounded-[14px] bg-cream2 px-6 py-14 text-center md:py-20">
      <Cookie size={36} className="mx-auto text-rose-deep" aria-hidden />
      <h2 className="mt-4 text-[26px] leading-tight md:text-[30px]">The menu is being updated</h2>
      <p className="mx-auto mt-2 max-w-[40ch] text-[15px] text-muted">Message {ownerName} to order in the meantime.</p>
      <WhatsAppButton
        number={whatsappNumber}
        message={`Hi ${ownerName}! I'd like to place an order.`}
        className="btn-wa mt-6 w-auto px-6"
      >
        Message {ownerName}
      </WhatsAppButton>
    </div>
  );
}
