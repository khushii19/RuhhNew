import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { logInbound, verifySignature } from "@/lib/whatsapp";

/** Meta webhook verification handshake. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");
  if (mode === "subscribe" && token && token === env.whatsapp.verifyToken && challenge) {
    return new Response(challenge, { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

/** Inbound messages and delivery statuses. */
export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifySignature(raw, req.headers.get("x-hub-signature-256"))) {
    return new Response("Invalid signature", { status: 401 });
  }
  try {
    await logInbound(JSON.parse(raw));
  } catch (e) {
    console.error("whatsapp webhook error", e);
  }
  return NextResponse.json({ ok: true });
}
