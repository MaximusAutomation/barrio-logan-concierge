/**
 * /api/analytics — server-side event receiver for attach-rate measurement.
 *
 * Receives analytics events beaconed from the client (via navigator.sendBeacon
 * or fetch). Logs each event to stdout so it appears in Vercel/Cloudflare
 * function logs for the host to query.
 *
 * Also increments in-memory counters (see src/lib/analytics-counters.ts) for
 * the /host/dashboard page. Note: counters reset on cold start (serverless).
 *
 * Security:
 *   - Only accepts the 4 known event types (allowlist).
 *   - Validates and size-caps the optional meta field.
 *   - Per-IP rate limiting (60 events/min) to prevent counter inflation.
 *
 * No PII is collected. No external analytics service. No cookies.
 */

import { NextResponse } from "next/server";
import { incrementCounter } from "@/lib/analytics-counters";

export const runtime = "nodejs";

/** Only these event types are accepted. Everything else is rejected. */
const ALLOWED_EVENTS = new Set([
  "upsell-impression",
  "upsell-request",
  "booking-impression",
  "booking-click",
]);

/** Maximum serialized size of the meta field (bytes). */
const MAX_META_SIZE = 1024;

/** Rate limit: max events per window per IP. */
const RATE_LIMIT_MAX = 60;
/** Rate limit window in milliseconds (1 minute). */
const RATE_LIMIT_WINDOW_MS = 60_000;

/** Per-IP rate limit buckets (module-level, resets on cold start). */
const rateBuckets = new Map<string, { count: number; windowStart: number }>();

function extractIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (!forwarded) return "local";
  return forwarded.split(",")[0].trim();
}

function isRateLimited(req: Request): boolean {
  const ip = extractIP(req);
  const now = Date.now();
  let bucket = rateBuckets.get(ip);

  if (!bucket || now - bucket.windowStart >= RATE_LIMIT_WINDOW_MS) {
    rateBuckets.set(ip, { count: 1, windowStart: now });
    return false;
  }

  bucket.count += 1;
  return bucket.count > RATE_LIMIT_MAX;
}

/**
 * Validate and sanitize the meta field.
 * Returns the sanitized meta object, or null if invalid/oversized.
 */
function validateMeta(
  meta: unknown
): Record<string, string | number | boolean> | null {
  if (meta === undefined || meta === null) return {};
  if (typeof meta !== "object" || Array.isArray(meta)) return null;

  const serialized = JSON.stringify(meta);
  if (serialized.length > MAX_META_SIZE) return null;

  // Only allow string, number, and boolean values (flat object)
  const result: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(meta as Record<string, unknown>)) {
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      result[key] = value;
    }
  }
  return result;
}

export async function POST(req: Request): Promise<Response> {
  try {
    // Rate limit check
    if (isRateLimited(req)) {
      return new NextResponse(null, { status: 429 });
    }

    const body = await req.json();

    const event = body?.event;
    if (typeof event !== "string" || !ALLOWED_EVENTS.has(event)) {
      return NextResponse.json(
        { error: "Invalid or unknown event type" },
        { status: 400 }
      );
    }

    // Validate meta
    const meta = validateMeta(body?.meta);
    if (meta === null) {
      return NextResponse.json(
        { error: "Invalid or oversized meta field" },
        { status: 400 }
      );
    }

    // Increment the total counter for this event type
    incrementCounter(event);

    // Increment compound counters for breakdown tables on the dashboard.
    // booking-click:partner → clicks by partner; upsell-request:optionId → requests by option.
    if (event === "booking-click" && typeof meta.partner === "string") {
      const partner = meta.partner.slice(0, 50); // cap key length
      incrementCounter(`booking-click:${partner}`);
    }
    if (event === "upsell-request" && typeof meta.optionId === "string") {
      const optionId = meta.optionId.slice(0, 50);
      incrementCounter(`upsell-request:${optionId}`);
    }

    // Log to stdout for Vercel/Cloudflare function log capture.
    // The host can filter logs by "analytics-event" to see all tracked events.
    console.log(
      JSON.stringify({
        type: "analytics-event",
        event,
        meta,
        timestamp: body?.timestamp ?? new Date().toISOString(),
      })
    );

    // 204 No Content — fire-and-forget from the client's perspective.
    return new NextResponse(null, { status: 204 });
  } catch {
    // Malformed body — still return 204 so the client doesn't retry.
    return new NextResponse(null, { status: 204 });
  }
}
