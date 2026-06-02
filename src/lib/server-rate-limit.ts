/**
 * Server-side in-memory abuse rate limiter for /api/chat.
 *
 * This is an ADDITIVE cost-protection layer — it does NOT replace or alter the
 * client-side 4/day UX cap in src/lib/rate-limit.ts, which remains the primary
 * guest-facing quota mechanism (a locked PROJECT.md decision).
 *
 * ── Design ──────────────────────────────────────────────────────────────────
 * • Algorithm:  fixed-window counter, per IP address.
 * • Window:     60 seconds (configurable via SERVER_RATE_LIMIT_WINDOW_MS).
 * • Limit:      15 requests per window per IP (configurable via SERVER_RATE_LIMIT_MAX).
 * • IP source:  x-forwarded-for header (set by Vercel's edge), falling back to
 *               a placeholder for local dev where the header is absent.
 * • Storage:    in-process Map — no database, no Redis, zero added cost.
 *
 * ── Serverless caveat (IMPORTANT) ───────────────────────────────────────────
 * In-memory state is scoped to a single serverless function instance and resets
 * on every cold start. Under Vercel's Hobby tier, concurrent warm instances mean
 * a determined caller could cycle across instances to bypass this limit. This
 * module is therefore a FIRST LINE OF DEFENSE against accidental or low-effort
 * abuse — not a hard security guarantee. The real cost backstop is the owner's
 * Groq (or Anthropic) spend cap configured in the provider dashboard.
 *
 * ── Wiring ──────────────────────────────────────────────────────────────────
 * Call checkServerRateLimit(req) at the top of POST in /api/chat/route.ts.
 * It returns null when the request is allowed, or a ready-to-return 429 Response
 * when the IP is over the limit.
 */

/** One bucket in the fixed-window map. */
interface Bucket {
  count: number;
  windowStart: number; // epoch ms
}

/** Per-IP state (module-level — lives for the lifetime of this instance). */
const buckets = new Map<string, Bucket>();

/** Max requests allowed per window per IP. Default: 15. */
const MAX_REQUESTS = parseInt(
  process.env.SERVER_RATE_LIMIT_MAX ?? "15",
  10
);

/** Window length in milliseconds. Default: 60 000 ms (1 minute). */
const WINDOW_MS = parseInt(
  process.env.SERVER_RATE_LIMIT_WINDOW_MS ?? "60000",
  10
);

/**
 * Extract the caller's IP from the x-forwarded-for header (Vercel sets this).
 * Falls back to "local" for dev environments where the header is absent.
 */
function extractIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (!forwarded) return "local";
  // x-forwarded-for may be "client, proxy1, proxy2" — take the leftmost (client).
  return forwarded.split(",")[0].trim();
}

/**
 * Check whether this request is within the rate limit for its IP.
 *
 * @returns null if the request is allowed (caller should proceed).
 *          A 429 Response if the IP is over the limit (caller should return it immediately).
 */
export function checkServerRateLimit(req: Request): Response | null {
  const ip = extractIP(req);
  const now = Date.now();

  let bucket = buckets.get(ip);

  if (!bucket || now - bucket.windowStart >= WINDOW_MS) {
    // New IP or expired window — start a fresh bucket.
    bucket = { count: 1, windowStart: now };
    buckets.set(ip, bucket);
    return null; // first request in window, always allowed
  }

  bucket.count += 1;

  if (bucket.count > MAX_REQUESTS) {
    const retryAfterSec = Math.ceil(
      (WINDOW_MS - (now - bucket.windowStart)) / 1000
    );
    return new Response(
      JSON.stringify({
        error: "Too many requests. Please wait before asking again.",
        retryAfterSeconds: retryAfterSec,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(retryAfterSec),
        },
      }
    );
  }

  return null; // within limit
}
