/**
 * Contract A — shared TypeScript types for guide.json.
 *
 * THIS IS THE SINGLE SOURCE OF TRUTH for guide.json shapes.
 * Every agent / module must import from here — no duplicate type definitions.
 *
 * Canonical import path: @/lib/guide
 */

/** WiFi credentials for the property. */
export interface Wifi {
  ssid: string;
  password: string;
}

/** Top-level property metadata. */
export interface Property {
  name: string;
  address: string;
  neighborhood: string;
  wifi: Wifi;
  checkin: string;
  checkout: string;
  houseRules: string[];
  /** Optional hero image URL shown in the property header. */
  imageUrl?: string;
}

/** A single place entry within a category. */
export interface Place {
  name: string;
  /** 1-2 sentence guest-facing description. */
  blurb: string;
  /** walk = ≤15 min on foot; short-hop = ≤15 min by drive/transit/bike; day-trip = worth the drive, beyond ~15 min */
  tier: "walk" | "short-hop" | "day-trip";
  /** Human-readable distance/time, e.g. "6 min walk" or "10 min drive" */
  distanceText: string;
  address: string;
  mapUrl: string;
  hours: string;
  priceLevel: "$" | "$$" | "$$$";
  tags: string[];
  hostTip: string;
  /** Optional photo URL for this place. When absent the card renders without an image. */
  imageUrl?: string;
}

/** A named category containing a list of places. */
export interface Category {
  /** Must be one of the canonical category IDs. */
  id: "grocery" | "food" | "coffee" | "bars" | "beaches" | "activities" | "transit";
  label: string;
  places: Place[];
  /** Optional banner image URL shown above the places list for this category. */
  imageUrl?: string;
}

/** Root shape of guide.json. */
export interface Guide {
  property: Property;
  categories: Category[];
}
