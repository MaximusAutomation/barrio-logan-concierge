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
 * No PII is collected. No external analytics service. No cookies.
 */

import { NextResponse } from "next/server";
import { incrementCounter } from "@/lib/analytics-counters";

export const runtime = "nodejs";

export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.json();

    const event = body?.event;
    if (typeof event !== "string" || event.length === 0 || event.length > 100) {
      return NextResponse.json(
        { error: "Invalid event" },
        { status: 400 }
      );
    }

    // Increment in-memory counter for the dashboard
    incrementCounter(event);

    // Log to stdout for Vercel/Cloudflare function log capture.
    // The host can filter logs by "analytics-event" to see all tracked events.
    console.log(
      JSON.stringify({
        type: "analytics-event",
        event,
        meta: body?.meta ?? {},
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
