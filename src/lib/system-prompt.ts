/**
 * System-prompt builder for the 325 Barrio Guest Concierge.
 *
 * Produces the PRD-spec persona prompt and injects the full guide.json as a
 * grounding block so the model never has to invent information.
 *
 * Usage (server-side only):
 *   import { buildSystemPrompt } from "@/lib/system-prompt";
 *   import type { Guide } from "@/lib/guide";
 *
 *   const prompt = buildSystemPrompt(guide);
 */

import type { Guide } from "@/lib/guide";

/**
 * Build a sanitized projection of the guide suitable for LLM grounding.
 *
 * Strips all imageUrl fields (property, category, and place level) before
 * serialization so that Unsplash or other decorative image URLs are never
 * presented to the model as factual data about the property or places.
 * The UI still imports the raw guide.json directly — only this serialization
 * path is sanitized.
 *
 * Booking fields (booking.partner, booking.label) are intentionally kept in
 * the grounding so the model knows which services are bookable and can point
 * guests to the right card. The booking.partner value is a config KEY — it
 * does NOT contain a URL. The resolved affiliate URL lives server-only in
 * src/lib/partners.ts and is never serialized here or in any client path.
 */
function sanitizeGuideForGrounding(guide: Guide): Guide {
  // Strip imageUrl at all three levels (property, category, place) before
  // serialization so decorative image URLs are not fed to the model as facts.
  // omitKey is a tiny helper that avoids ESLint unused-var warnings from
  // destructure-and-discard patterns.
  function omitImageUrl<T extends { imageUrl?: string }>(
    obj: T
  ): Omit<T, "imageUrl"> {
    const copy = { ...obj };
    delete copy.imageUrl;
    return copy;
  }

  return {
    property: omitImageUrl(guide.property) as Guide["property"],
    categories: guide.categories.map((cat) => ({
      ...omitImageUrl(cat),
      places: cat.places.map(
        (place) => omitImageUrl(place) as Guide["categories"][number]["places"][number]
      ),
    })),
  };
}

/**
 * Build the concierge system prompt from the provided guide object.
 *
 * The prompt embeds a sanitized guide JSON (image URLs stripped) so the
 * model's only allowed knowledge source is the guide content — it cannot
 * invent places, prices, or hours that are not in the data. Image URLs are
 * decorative and excluded so they are not treated as factual assertions.
 */
export function buildSystemPrompt(guide: Guide): string {
  const { property } = guide;

  // Serialize a sanitized copy of the guide (no imageUrls) for grounding.
  // Pretty-printed so the model can parse it more reliably, at the cost of
  // a few extra tokens.
  const sanitizedGuide = sanitizeGuideForGrounding(guide);
  const guideBlock = JSON.stringify(sanitizedGuide, null, 2);

  return `\
You are a friendly, warm, and concise local host for ${property.name} at ${property.address} in ${property.neighborhood}.

Your role is to help guests feel at home and make the most of their stay. You answer questions about:
- The property itself (WiFi, check-in/check-out, house rules, basics)
- Nearby places listed in the guide (grocery stores, food, beaches, activities, getting around)
- Bookable services (airport transfers, bike rentals, tours, beach gear) listed in the "Book & Get Around" section

STRICT RULES:
1. You may ONLY use information from the GUIDE DATA block below. Do not draw on any outside knowledge.
2. Never invent, guess, or extrapolate place names, addresses, hours, prices, or any facts not present in the guide.
3. If a guest asks about something not covered in the guide — restaurants not listed, hotels, events, news, general travel advice, or anything else off-topic — warmly decline and redirect them to what you CAN help with. Example: "I can only speak to what's in the guide for this property, but I'm happy to help you find a grocery store, a great taco spot nearby, or the fastest way to the beach!"
4. Be brief and practical. Guests are on their phones.
5. Use a warm, personal tone — like a knowledgeable neighbor, not a directory listing.
6. When a guest has used all their daily questions and the out-of-quota message is shown, give a kind acknowledgment that the concierge resets at midnight.
7. BOOKABLE SERVICES: When a guest asks about getting to/from the airport, renting a bike, finding tours or experiences, or getting beach gear — mention the relevant entry from the "Book & Get Around" category by name, describe what it offers, and tell them to tap the orange "Book" button on that card in the guide. Do NOT emit booking URLs, affiliate links, or any URL from the booking field — just refer guests to the card's button. The booking cards appear in the "Book & Get Around" tab of the guide.

PROPERTY QUICK-REFERENCE:
- Name: ${property.name}
- Address: ${property.address}
- Neighborhood: ${property.neighborhood}
- WiFi SSID: ${property.wifi.ssid}
- WiFi Password: ${property.wifi.password}
- Check-in: ${property.checkin}
- Check-out: ${property.checkout}
- House Rules: ${property.houseRules.join("; ")}

GUIDE DATA (your ONLY allowed knowledge source):
\`\`\`json
${guideBlock}
\`\`\`
`;
}
