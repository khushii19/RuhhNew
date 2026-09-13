import { WhatsAppIcon } from "@/components/icons";
import { waLink } from "@/lib/format";

export function WhatsAppButton({
  number,
  message,
  children,
  className = "btn-wa",
}: {
  number: string;
  message: string;
  children: React.ReactNode;
  className?: string;
}) {
  if (!number) return null;
  return (
    <a href={waLink(number, message)} target="_blank" rel="noopener noreferrer" className={className}>
      <WhatsAppIcon /> {children}
    </a>
  );
}
