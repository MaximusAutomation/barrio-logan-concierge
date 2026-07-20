/**
 * /api/analytics/counters — returns server-side in-memory event counters.
 *
 * Used by the /host/dashboard page to display server-side metrics.
 * These counters reset on cold start (serverless limitation).
 * For durable analytics, the host uses Vercel function logs (stdout).
 *
 * Gated behind HOST_DASHBOARD_KEY — the host must provide the key
 * via Authorization header (Bearer <key>) or ?key= query parameter.
 */

import { NextResponse } from "next/server";
import { getCounters } from "@/lib/analytics-counters";
import { validateHostKey, extractHostKey } from "@/lib/host-auth";

export const runtime = "nodejs";

export async function GET(req: Request): Promise<Response> {
  const key = extractHostKey(req);

  if (!validateHostKey(key)) {
    return NextResponse.json(
      { error: "Unauthorized. Provide HOST_DASHBOARD_KEY via Authorization header or ?key= parameter." },
      { status: 401 }
    );
  }

  return NextResponse.json(getCounters());
}
