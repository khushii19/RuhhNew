/**
 * Small in-memory rate limiter. Each serverless instance keeps its own
 * counters, so this is a first line of defence against casual abuse, not a
 * guarantee. Pair it with Vercel Firewall rules for anything stronger.
 */
const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    if (buckets.size > 5000) {
      for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
    }
    return { ok: true, retryAfter: 0 };
  }
  b.count += 1;
  if (b.count > limit) return { ok: false, retryAfter: Math.ceil((b.reset - now) / 1000) };
  return { ok: true, retryAfter: 0 };
}

export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd?.split(",")[0] ?? req.headers.get("x-real-ip") ?? "unknown").trim();
}

export function tooMany(retryAfter: number) {
  return new Response(JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }), {
    status: 429,
    headers: { "content-type": "application/json", "retry-after": String(retryAfter) },
  });
}
