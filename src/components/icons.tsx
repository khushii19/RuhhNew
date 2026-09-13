import { InstagramLogo, WhatsappLogo } from "@phosphor-icons/react/dist/ssr";

export function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return <WhatsappLogo size={size} weight="fill" aria-hidden="true" />;
}

export function InstagramIcon({ size = 16 }: { size?: number }) {
  return <InstagramLogo size={size} weight="regular" aria-hidden="true" />;
}
