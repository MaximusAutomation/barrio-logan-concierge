/**
 * /api/analytics/counters — returns server-side in-memory event counters.
 *
 * Used by the /host/dashboard page to display server-side metrics.
 * These counters reset on cold start (serverless limitation).
 * For durable analytics, the host uses Vercel function logs or the
 * client-side localStorage export on the dashboard.
 */

import { NextResponse } from "next/server";
import { getCounters } from "@/lib/analytics-counters";

export const runtime = "nodejs";

export async function GET(): Promise<Response> {
  return NextResponse.json(getCounters());
}
