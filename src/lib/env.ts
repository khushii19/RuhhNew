/** Central place for environment variables so missing config fails loudly. */
export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  adminEmails: (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
  email: {
    apiKey: process.env.RESEND_API_KEY ?? "",
    from: process.env.EMAIL_FROM ?? "Ruhh <orders@resend.dev>",
    alertTo: process.env.ORDER_ALERT_EMAIL ?? "",
  },
  cronSecret: process.env.CRON_SECRET ?? "",
  whatsapp: {
    token: process.env.WHATSAPP_ACCESS_TOKEN ?? "",
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID ?? "",
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN ?? "",
    appSecret: process.env.WHATSAPP_APP_SECRET ?? "",
    orderTemplate: process.env.WHATSAPP_ORDER_TEMPLATE ?? "",
    statusTemplate: process.env.WHATSAPP_STATUS_TEMPLATE ?? "",
    templateLang: process.env.WHATSAPP_TEMPLATE_LANG ?? "en",
    ownerAlertNumber: process.env.WHATSAPP_OWNER_ALERT_NUMBER ?? "",
  },
};

/**
 * A non-empty but malformed NEXT_PUBLIC_SUPABASE_URL (a placeholder left in
 * the hosting environment, say) used to pass this check and then throw inside
 * createClient, which fails the production build while prerendering. Treat an
 * unusable URL as "not configured" so the app degrades instead.
 */
export function isSupabaseConfigured() {
  return Boolean(env.supabaseAnonKey) && isHttpUrl(env.supabaseUrl);
}

function isHttpUrl(value: string) {
  if (!value) return false;
  try {
    const { protocol } = new URL(value);
    return protocol === "https:" || protocol === "http:";
  } catch {
    console.warn(`Ignoring NEXT_PUBLIC_SUPABASE_URL: ${value} is not a valid URL.`);
    return false;
  }
}

export function isWhatsAppApiConfigured() {
  return Boolean(env.whatsapp.token && env.whatsapp.phoneNumberId);
}
