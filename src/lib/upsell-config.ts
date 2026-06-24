/**
 * Upsell configuration — early check-in and late checkout pricing + settings.
 *
 * ---------------------------------------------------------------------------
 * OWNER: Adjust prices, descriptions, and enable/disable flags below.
 * No code changes elsewhere are needed — the UI reads this config at runtime.
 * ---------------------------------------------------------------------------
 *
 * IMPORTANT: This is a REQUEST-based flow, NOT auto-confirm. Because there is
 * no calendar/PMS integration, every request requires host approval before the
 * guest is confirmed. This avoids overselling time when the room is turning
 * over to the next guest. When calendar gating is added later, the flow can
 * be upgraded to instant-confirm for eligible dates.
 *
 * Pricing guidance (grounded in market data):
 *   - Airbnb network average: ~$52 for early/late
 *   - Verified market range: $25–$50 per stay
 *   - Default: $35 each (mid-range, adjustable below)
 */

export interface UpsellOption {
  /** Unique identifier for this upsell. */
  id: string;
  /** Guest-facing title. */
  title: string;
  /** Guest-facing description (1–2 sentences). */
  description: string;
  /** Price in USD. Change freely — the UI reads this value. */
  price: number;
  /** Whether this upsell is currently offered to guests. Set false to hide. */
  enabled: boolean;
  /** The adjusted time shown to guests (e.g., "12:00 PM" for early check-in). */
  adjustedTime: string;
}

export interface UpsellConfig {
  /** Master switch — set false to hide the entire upsell section. */
  enabled: boolean;
  /** Guest-facing section heading. */
  heading: string;
  /** Guest-facing subheading / explanation. */
  subheading: string;
  /** The individual upsell options. */
  options: UpsellOption[];
  /**
   * Where the host receives request notifications.
   * Currently supports "log" (stdout/server logs only).
   * Future: "email", "webhook", "sms" can be added.
   */
  notificationMethod: "log";
}

/**
 * The active upsell configuration.
 *
 * To adjust pricing: change the `price` values below.
 * To disable an option: set its `enabled` to false.
 * To disable the entire section: set the top-level `enabled` to false.
 */
export const UPSELL_CONFIG: UpsellConfig = {
  enabled: true,
  heading: "Flexible check-in & checkout",
  subheading:
    "Need extra time? Request early check-in or late checkout — subject to availability.",
  options: [
    {
      id: "early-checkin",
      title: "Early check-in",
      description:
        "Arrive early and settle in. Check in at 12:00 PM instead of the standard 3:00 PM.",
      price: 35,
      enabled: true,
      adjustedTime: "12:00 PM",
    },
    {
      id: "late-checkout",
      title: "Late checkout",
      description:
        "Sleep in and leave on your own schedule. Check out at 2:00 PM instead of 11:00 AM.",
      price: 35,
      enabled: true,
      adjustedTime: "2:00 PM",
    },
  ],
  notificationMethod: "log",
};

/** Look up a single upsell option by ID. */
export function getUpsellOption(id: string): UpsellOption | undefined {
  return UPSELL_CONFIG.options.find((o) => o.id === id);
}
