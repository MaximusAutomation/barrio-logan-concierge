# Host Verification Checklist — Before Launch

These items were flagged during place research as needing owner confirmation
before the guide goes live. Check each one against current Google Maps,
the venue's social media, or a quick phone call.

---

## Identity / Address

- **Fish Guts (2222 Logan Ave)** — Web-verified OPEN (2026-06-02). Hours confirmed: Closed Mon-Tue; Wed-Fri 12pm-9pm; Sat-Sun 12pm-6pm. Entry retained in guide.

## Hours — Web-Verified OPEN

The following three venues were web-verified open as of 2026-06-02:

- **Tiny Giant Taproom (1985 National Ave, Ste 1132)** — VERIFIED OPEN. Confirmed hours: Mon-Sat 12pm-10pm, Sun 12pm-8pm. Note: this is a separate unit from Attitude Brewing (which is closed) in the same Mercado del Barrio complex.
- **Maggie's Cafe (1985 National Ave Suite 1129)** — VERIFIED OPEN at the Barrio Logan / National Ave location. Confirmed hours: Mon 7:30am-3pm; Tue-Sat 7:30am-6pm; Sun 7:30am-3pm. Remind guests this is NOT the separate Serra Mesa/Greyling Dr location.
- **Fish Guts (2222 Logan Ave)** — VERIFIED OPEN. Confirmed hours: Closed Mon-Tue; Wed-Fri 12pm-9pm; Sat-Sun 12pm-6pm.

## Hours Still to Verify Before Launch

- **Fonda del Barrio** — Split weekend schedule (brunch 9am-1:30pm + dinner from 4pm Sat-Sun); opened 2025 and is relatively new. Confirm current hours and whether reservations are recommended.
- **El Carrito** — Low risk; confirm daily 8am-6pm hours are still current.
- **Por Vida** — Daily 8am-6pm hours can shift seasonally and around neighborhood events. Confirm before launch.
- **Cafe Moto** — Closes earlier than most cafes (Mon-Fri 3pm, Sat-Sun 2:30pm). Verify hours so guests are not surprised.
- **Chikita Cafe** — Confirm daily 7am-4pm hours and that the boutique is open during visits.
- **Ryan Bros Coffee** — Confirm this is the Barrio Logan / Main St location and not one of their other San Diego shops; verify hours (Mon-Fri 6am-5pm, Sat-Sun 7am-5pm).
- **Mujeres Brew House** — Confirm current hours and Monday closure (can change for events). The food depends on the day's rotating vendor; confirm a vendor will be on-site if a guest is going specifically to eat.

## Bars / Breweries Excluded From the Guide

The following three venues were researched and deliberately excluded due to closure or unverified addresses. Do NOT add them back without independent confirmation:

- **Attitude Brewing Company (1985 National Ave, Ste 1115)** — Closed / for sale. Tiny Giant Taproom operates as a separate unit in the same complex and is open — do not confuse the two.
- **Border X Brewing (2181 Logan Ave)** — The longtime Barrio Logan taproom is closed. The brand runs occasional pop-ups only. Do not send guests to the old address expecting an open taproom. Check their Instagram for pop-up locations if a guest is a craft-beer enthusiast.
- **TapRoom Beer Company — Barrio Logan** — Exact street address is missing/unverified and hours are unknown. LOW CONFIDENCE. Confirm the location is open and has a verified address before adding it.

## Beach Logistics

- **Drive times (web-verified 2026-06-02):** Mission Beach ~15-20 min (~9 mi); Sunset Cliffs ~15-20 min (~9 mi); La Jolla Cove ~25 min (~15 mi). These are reflected in the guide entries.
- **Mission Beach Boardwalk** — Belmont Park ride hours shift seasonally and by day of week. Confirm current hours before guests visit the amusement park specifically.
- **Sunset Cliffs Natural Park and La Jolla Cove** — Low risk for the venues themselves; main caveat is parking fills early. Remind guests to arrive before 10am (or 30-45 min before sunset at Cliffs) on busy weekends.

## Images — Owner Action Required

- **Hero image and category-banner images** are currently decorative Unsplash placeholders. They are functional and display well, but the owner should swap them for real photos of the property and neighborhood before launch. Replace by updating the `imageUrl` fields in `src/data/guide.json` (property.imageUrl and each category's imageUrl) to point to your own hosted images.
- **Place-level imageUrl** fields are intentionally left out of existing entries (infrastructure is in place). The owner can add individual place photos by filling in `imageUrl` on any place entry — the card renders the thumbnail automatically when the field is present.
