/**
 * Partner config — bookable services + curated local experiences for the
 * Barrio Logan Guest Concierge.
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
 *   - Viator           -> https://www.viatoraffiliates.com  (~8% commission)
 *   - GetYourGuide     -> https://partner.getyourguide.com  (~8% commission)
 *   - Jayride / Mozio  -> https://www.jayride.com/affiliates (airport transfers)
 *   - Local operators  -> Contact directly for referral/promo code arrangements
 *
 * Affiliate URLs are public, committed config — they are NOT secrets.
 *
 * CHICANO PARK GUARDRAIL: Chicano Park is a sacred National Historic Landmark.
 * Do NOT add a for-profit paid tour OF Chicano Park. Community-led, free, or
 * donation-based Chicano Park content is fine; paid/affiliate monetization of
 * the park itself is not. Keep paid tour content focused on the broader Barrio
 * Logan food/beer/arts scene and greater San Diego.
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
 * Partner key -> config map.
 *
 * Add new partners by adding a new key here.  The key value is the same
 * string used in Place.booking.partner in guide.json and in the /go/<key>
 * URL.  Keep keys kebab-case and lowercase.
 */
export const PARTNERS: Record<string, PartnerConfig> = {
  // ─── EXISTING SERVICES ─────────────────────────────────────────────────────

  /**
   * Airport transfer — pre-booked ride from/to SAN.
   * PLACEHOLDER: replace with your Jayride or Mozio affiliate link.
   */
  "airport-transfer": {
    label: "Book Airport Transfer",
    url: "https://www.jayride.com/airport-transfers/us/san-diego-international-airport/",
    note: "PLACEHOLDER — join Jayride affiliate program and replace with your tagged link.",
  },

  /**
   * E-bike / bicycle rental — local bike-rental option near Barrio Logan.
   * PLACEHOLDER: replace with your rental partner's booking page or affiliate link.
   */
  ebike: {
    label: "Reserve E-Bike",
    url: "https://wheelfunrentals.com/locations/san-diego/",
    note: "PLACEHOLDER — contact Wheel Fun Rentals or local bike shop for a referral/affiliate link.",
  },

  /**
   * Beach gear rental — chairs, umbrellas, boogie boards, baby gear.
   * PLACEHOLDER: replace with your BabyQuip affiliate link.
   */
  "beach-gear": {
    label: "Rent Beach Gear",
    url: "https://www.babyquip.com/san-diego-ca",
    note: "PLACEHOLDER — join BabyQuip affiliate program and replace with your tagged link.",
  },

  // ─── CURATED LOCAL EXPERIENCES (Lever 2) ───────────────────────────────────
  // These are the "Book it" buttons designed to test click-to-book attach rate.
  // Start with Viator/GetYourGuide affiliate links (~8% commission).
  // Once you have direct relationships with local operators, swap in their
  // direct booking links or promo codes for higher commission splits.

  /**
   * Brewery & taco crawl — guided food/drink tour of the Barrio Logan and
   * greater San Diego craft beer + street taco scene.
   * PLACEHOLDER: replace with your Viator or GetYourGuide affiliate link for
   * a San Diego brewery/taco/food tour.
   */
  "brewery-taco-crawl": {
    label: "Book Crawl",
    url: "https://www.viator.com/San-Diego-tours/Food-Tours/d646-g6-c1",
    note: "PLACEHOLDER — join Viator (~8% commission) and replace with an affiliate-tagged link for a San Diego food/brewery tour. Or negotiate a direct split with a local operator.",
  },

  /**
   * Coronado & bay activity — kayak, paddleboard, harbor cruise, or bike
   * tour around Coronado Island and San Diego Bay.
   * PLACEHOLDER: replace with your Viator or GetYourGuide affiliate link.
   */
  "bay-adventure": {
    label: "Book Activity",
    url: "https://www.viator.com/San-Diego-tours/Water-Sports/d646-g6-c81",
    note: "PLACEHOLDER — join Viator (~8% commission) and replace with an affiliate-tagged link for a Coronado/bay water activity. Or negotiate with a local kayak/paddleboard operator.",
  },

  /**
   * Local restaurant reservation — curated pick for a standout Barrio Logan
   * or nearby dining experience.
   *
   * NOTE: Most independent local restaurants don't have affiliate programs.
   * Options for the host:
   *   1. Use a direct link to the restaurant's booking page (no commission,
   *      but great guest experience and builds the local relationship).
   *   2. Negotiate a referral arrangement directly with the restaurant
   *      (e.g., 10% of referred covers, or a promo code).
   *   3. Use an OpenTable affiliate link if the restaurant is listed there.
   *
   * PLACEHOLDER: replace with the restaurant's reservation page or your
   * negotiated referral link.
   */
  "local-dining": {
    label: "Reserve Table",
    url: "https://www.opentable.com/s?term=barrio+logan+san+diego",
    note: "PLACEHOLDER — replace with a direct link to a recommended restaurant's reservation page, or negotiate a referral deal with a local spot (e.g., Las Cuatro Milpas, Salud!, etc.).",
  },

  /**
   * Tours & experiences — general San Diego tours (harbor cruises, Old Town
   * walks, whale watching, etc.). Kept as a catch-all for experiences that
   * don't fit the curated categories above.
   * PLACEHOLDER: replace with your Viator or GetYourGuide affiliate link.
   *
   * CHICANO PARK NOTE: This links to general San Diego tours, NOT a paid
   * tour of Chicano Park. Any Chicano Park content should be community-led,
   * free, or donation-based. See the guardrail comment at the top of this file.
   */
  tours: {
    label: "Browse Tours",
    url: "https://www.viator.com/San-Diego/d646-ttd",
    note: "PLACEHOLDER — join Viator or GetYourGuide affiliate program and replace with your tagged link. Do NOT link to for-profit Chicano Park tours.",
  },
};

/** Look up a partner by key. Returns undefined if the key is not registered. */
export function getPartner(key: string): PartnerConfig | undefined {
  return PARTNERS[key];
}
