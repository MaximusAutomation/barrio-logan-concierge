/**
 * /api/upsell-request — handles guest requests for early check-in / late checkout.
 *
 * This is a REQUEST flow (manual host approval), not auto-confirm.
 * Without calendar/PMS integration, every request must be reviewed by the host
 * to ensure the room isn't turning over to another guest.
 *
 * The route:
 *   1. Validates the request payload (option ID, guest name, room/booking ref)
 *   2. Logs the request to stdout (Vercel function logs) for host notification
 *   3. Returns a confirmation that the request was received
 *
 * Future enhancements:
 *   - Email/SMS notification to host (env: UPSELL_NOTIFY_EMAIL / UPSELL_NOTIFY_PHONE)
 *   - Calendar gating (check PMS for turnover conflicts before accepting)
 *   - Payment integration (Stripe/Square link in the confirmation)
 *
 * No PII beyond the guest's first name is stored. The request log in stdout
 * contains only what the host needs to action the request.
 */

import { NextResponse } from "next/server";
import { getUpsellOption } from "@/lib/upsell-config";

export const runtime = "nodejs";

interface UpsellRequestBody {
  /** The upsell option ID (e.g., "early-checkin", "late-checkout"). */
  optionId: string;
  /** Guest's first name (for the host to identify the request). */
  guestName: string;
  /** Room number or booking reference (optional, for multi-room properties). */
  roomRef?: string;
  /** Any note from the guest (e.g., "arriving on a 6am flight"). */
  note?: string;
}

export async function POST(req: Request): Promise<Response> {
  try {
    const body = (await req.json()) as UpsellRequestBody;

    // Validate required fields
    const { optionId, guestName, roomRef, note } = body;

    if (!optionId || typeof optionId !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid optionId" },
        { status: 400 }
      );
    }

    if (!guestName || typeof guestName !== "string" || guestName.trim().length === 0) {
      return NextResponse.json(
        { error: "Missing or invalid guestName" },
        { status: 400 }
      );
    }

    // Server-side length caps (client maxLength is not a security boundary)
    if (typeof roomRef === "string" && roomRef.length > 100) {
      return NextResponse.json(
        { error: "roomRef too long (max 100 characters)" },
        { status: 400 }
      );
    }
    if (typeof note === "string" && note.length > 500) {
      return NextResponse.json(
        { error: "note too long (max 500 characters)" },
        { status: 400 }
      );
    }

    // Look up the upsell option
    const option = getUpsellOption(optionId);
    if (!option) {
      return NextResponse.json(
        { error: `Unknown upsell option: ${optionId}` },
        { status: 400 }
      );
    }

    if (!option.enabled) {
      return NextResponse.json(
        { error: "This option is not currently available" },
        { status: 400 }
      );
    }

    // Log the request to stdout for host notification via Vercel function logs.
    // Filter by "upsell-request" in the platform logs to see all requests.
    console.log(
      JSON.stringify({
        type: "upsell-request",
        optionId: option.id,
        optionTitle: option.title,
        price: option.price,
        adjustedTime: option.adjustedTime,
        guestName: guestName.trim(),
        roomRef: roomRef?.trim() ?? "",
        note: note?.trim() ?? "",
        timestamp: new Date().toISOString(),
      })
    );

    return NextResponse.json({
      success: true,
      message: `Your ${option.title.toLowerCase()} request has been sent to the host. You'll hear back shortly!`,
      option: {
        id: option.id,
        title: option.title,
        price: option.price,
        adjustedTime: option.adjustedTime,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
