/**
 * /go/[partner] — click-tracked partner redirect route.
 *
 * Looks up the partner key in the PARTNERS config, logs a click event for
 * basic attribution, and 302-redirects to the partner's booking URL.
 *
 * This indirection keeps raw affiliate URLs out of the guest-facing markup,
 * makes every booking click measurable in server logs, and lets the owner
 * swap affiliate URLs in one place (src/lib/partners.ts) without touching
 * any component code.
 *
 * Usage:  /go/airport-transfer  →  302 → partners["airport-transfer"].url
 *         /go/ebike             →  302 → partners["ebike"].url
 *         /go/unknown-key       →  404
 *
 * The route is intentionally simple — no auth, no database, no analytics SDK.
 * Click attribution comes from server logs (Vercel function logs / Cloudflare
 * Worker logs).  Each deployment platform captures stdout from route handlers.
 */

import { NextResponse } from "next/server";
import { getPartner } from "@/lib/partners";

export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ partner: string }>;
}

export async function GET(
  _request: Request,
  { params }: RouteParams
): Promise<Response> {
  const { partner } = await params;

  const config = getPartner(partner);

  if (!config) {
    // Unknown partner key — return 404 so broken links don't silently redirect
    // guests somewhere unexpected.
    return new NextResponse(
      `Partner "${partner}" not found. Check src/lib/partners.ts to add or fix it.`,
      { status: 404 }
    );
  }

  // Basic click attribution log — appears in Vercel function logs /
  // Cloudflare Worker logs.  No PII; just the partner key + timestamp.
  // To see click counts: Platform dashboard → Functions → Logs, filter by "booking-click".
  console.log(
    JSON.stringify({
      event: "booking-click",
      partner,
      label: config.label,
      timestamp: new Date().toISOString(),
    })
  );

  // 302 (temporary) redirect so the browser re-checks this route on each visit
  // rather than caching the destination.  Useful if the owner later swaps the
  // affiliate URL — guests get the new destination immediately.
  return NextResponse.redirect(config.url, { status: 302 });
}
