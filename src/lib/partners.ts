/**
 * Partner config — bookable services for the Barrio Logan Guest Concierge.
 *
 * ---------------------------------------------------------------------------
 * OWNER ACTION REQUIRED — PLACEHOLDER URLS BELOW
 * ---------------------------------------------------------------------------
 * Every `url` in this file is a PLACEHOLDER pointing to the partner's generic
 * San Diego page.  Once you have joined the relevant affiliate program and
 * received your affiliate-tagged link, replace the corresponding `url` value.
 * No code changes are needed anywhere else — the `/go/<key>` redirect route
 * reads this config at runtime.
 *
 * Affiliate programs to join:
 *   • Jayride / Mozio  → https://www.jayride.com/affiliates  (or Mozio partner portal)
 *   • Local bike shop  → contact the shop directly for a referral/affiliate arrangement
 *   • Viator           → https://www.viatoraffiliates.com
 *   • GetYourGuide     → https://partner.getyourguide.com
 *   • BabyQuip         → https://www.babyquip.com/partners  (or email partner@babyquip.com)
 *
 * Affiliate URLs are public, committed config — they are NOT secrets.
 * ---------------------------------------------------------------------------
 */

export interface PartnerConfig {
  /** Human-readable partner/service name shown as the default CTA label. */
  label: string;
  /**
   * The booking/affiliate URL guests are sent to via /go/<key>.
   * PLACEHOLDER — replace with your affiliate-tagged link once enrolled.
   */
  url: string;
  /** Owner-facing note explaining which program to join and what to replace. */
  note: string;
}

/**
 * Partner key → config map.
 *
 * Add new partners by adding a new key here.  The key value is the same
 * string used in Place.booking.partner in guide.json and in the /go/<key>
 * URL.  Keep keys kebab-case and lowercase.
 */
export const PARTNERS: Record<string, PartnerConfig> = {
  /**
   * Airport transfer — pre-booked ride from/to SAN.
   * PLACEHOLDER: replace with your Jayride or Mozio affiliate link.
   * Jayride affiliate program: https://www.jayride.com/affiliates
   * Mozio partner portal: https://www.mozio.com/en-us/partner/
   */
  "airport-transfer": {
    label: "Book Airport Transfer",
    url: "https://www.jayride.com/airport-transfers/us/san-diego-international-airport/",
    note: "PLACEHOLDER — join Jayride affiliate program and replace with your tagged link.",
  },

  /**
   * E-bike / bicycle rental — local bike-rental option near Barrio Logan.
   * PLACEHOLDER: replace with your rental partner's booking page or affiliate link.
   * A good local option is Wheel Fun Rentals (Embarcadero/Coronado) or any
   * bike-share partner you arrange.  Contact shops directly for referral deals.
   */
  ebike: {
    label: "Reserve E-Bike",
    url: "https://wheelfunrentals.com/locations/san-diego/",
    note: "PLACEHOLDER — contact Wheel Fun Rentals or local bike shop for a referral/affiliate link.",
  },

  /**
   * Tours & experiences — day tours, Chicano Park tours, harbor cruises, etc.
   * PLACEHOLDER: replace with your Viator or GetYourGuide affiliate link for
   * San Diego / Barrio Logan area tours.
   * Viator affiliates: https://www.viatoraffiliates.com
   * GetYourGuide partners: https://partner.getyourguide.com
   */
  tours: {
    label: "Book a Tour",
    url: "https://www.viator.com/San-Diego/d646-ttd",
    note: "PLACEHOLDER — join Viator or GetYourGuide affiliate program and replace with your tagged link.",
  },

  /**
   * Beach gear rental — beach chairs, umbrellas, boogie boards, etc.
   * BabyQuip also covers pack-n-plays, high chairs for families with young kids.
   * PLACEHOLDER: replace with your BabyQuip affiliate link.
   * BabyQuip partners: https://www.babyquip.com/partners or email partner@babyquip.com
   */
  "beach-gear": {
    label: "Rent Beach Gear",
    url: "https://www.babyquip.com/san-diego-ca",
    note: "PLACEHOLDER — join BabyQuip affiliate program and replace with your tagged link.",
  },
};

/** Look up a partner by key. Returns undefined if the key is not registered. */
export function getPartner(key: string): PartnerConfig | undefined {
  return PARTNERS[key];
}
