# Host Verification Checklist — Before Launch

These items were flagged during all-category re-research (web-verified 2026-06-03) as needing
owner confirmation before the guide goes live. Check each one against current Google Maps,
the venue's social media, or a quick phone call.

---

## Honest Walk-Distance Orientation

**Read this first.** The property at 325 S 30th St sits in residential Logan Heights, about
half a mile EAST of Barrio Logan's walkable commercial core. The immediate blocks are quiet,
low-rise residential. Guests should not expect a "5-minute walk to everything."

**What is truly sub-5 min walk:**
- **Sawaya Brothers Market (425 S 30th St)** — ~3 min, ONE BLOCK SOUTH on the same street.
  This is the only true sub-5-min food/grocery option. Verified open daily ~6am-9pm.
- **Memorial Community Park & skatepark (30th St & Ocean View Blvd)** — ~5 min south on
  30th St (borderline). Closest green space and the historic heart of old Calle Treinta.
- **MTS bus stops at Imperial Ave & 30th and National Ave & 30th** — ~2-3 min (one block
  north/south). Genuine transit access, though these are stops, not destinations.

**The realistic picture for everything else:**
- Nearest specialty coffee (Cafe Moto, 2619 National Ave): **~8 min walk**.
- Nearest trolley (25th & Commercial, Orange Line): **~12 min walk**.
- Logan Ave brewery/mural corridor (Por Vida, Mason Ale Works, Ciccia, etc.): **~12-17 min walk**.
- Chicano Park: **~14 min walk**.
- Mercado del Barrio / Northgate Market: **~20 min walk**.

All walk times are estimated from map coordinates at ~3 mph. Verify exact minutes in
Google/Apple Maps before publishing any specific walking claims.

---

## Critical: Mujeres Brew House Alcohol-License Suspension

**Mujeres Brew House (1983 Julian Ave)** — As of June 2026, Mujeres was under a 15-day
alcohol-license suspension, with service potentially NOT resuming until after June 4, 2026.
The brewery publicly warned it could close without a resolution. The guide entry reflects
this with a clear heads-up in the hostTip and an "uncertain" status caveat in the hours.

**Action required:** Check [@mujeresbrewhouse on Instagram](https://www.instagram.com/mujeresbrewhouse/)
or call before recommending to guests. If the suspension has been lifted and the brewery
is confirmed open, update the hours field to remove the caveat and update this note.

---

## Las Cuatro Milpas — May 2026 Reopening (Verify Smooth Operations)

**Las Cuatro Milpas (1985 National Ave, Suite 1131, Mercado del Barrio)** — Reopened in
May 2026 at a new location inside Mercado del Barrio. The guide reflects the updated address
and hours (Sun-Fri 8am-3pm, Sat 7am-3pm). Because this is a recent reopening, verify:
- Operations are running smoothly and consistently.
- Hours match what's published (small operations sometimes adjust in the first months).
- The 1985 National Ave suite number (1131) is correct on signage.

---

## Cardenas Markets — Drive Only, Confirm Hours

**Cardenas Markets (3807 National Ave)** — This is a drive-to destination, not a realistic
walk. The guide entry has been corrected to reflect "not a realistic walk / ~6 min drive."
Hours listed as "approx. 6:00 AM - 11:00 PM" are approximate. Call (619) 239-4709 to
confirm exact hours before recommending for late trips.

---

## Hours to Verify Before Launch

The following venues have hours that were best-estimate or are known to shift:

| Venue | Listed Hours | Why to Verify |
|-------|-------------|---------------|
| **Fonda del Barrio** (1985 Logan Ave) | Daily approx. 9am-8pm | New-ish spot; hours and address may have changed |
| **Todo Pa' La Cruda** (2226 Logan Ave) | Daily approx. 9am-3pm | Small barrio kitchen; hours shift seasonally |
| **Alchemy / Choose Thy Poison** (2210 Logan Ave) | Daily approx. 4pm-11pm | Address and hours are best-estimate; verify before launching |
| **Logan Inn** (2143 Logan Ave) | Wed-Mon ~10am-2am; Tue closed | Old-school dive; call ahead to confirm |
| **Drinky Promise** (2085 Logan Ave) | Tue 8:30am-2:30pm, Wed-Fri 7:30am-3:30pm, Sat-Sun 9am-4pm | Closed Mon; confirm current schedule |
| **The Shop Cafe** (1684 Logan Ave) | Mon-Fri 7am-11am, Sat-Sun 8am-1pm | Very short morning-only hours; confirm they haven't expanded |
| **La Bodega Gallery** (2196 Logan Ave) | Typically Mon-Fri 12pm-5pm | Their website may be outdated; check Instagram @labodegagallery |
| **El Rancho Tacos & Grill** (2181 Logan Ave) | Sun-Thu 8am-9pm, Fri-Sat 8am-10pm | Verify the suite/tenant at 2181 Logan (space has changed hands recently) |

---

## Address Cluster Alert: 2181 Logan Ave

The synth flagged that **Mason Ale Works, El Rancho Tacos & Grill, and formerly Border X
Brewing** are all associated with addresses at or near 2181 Logan Ave. Mason Ale Works
now occupies the old Border X space. El Rancho's listing at 2181 Logan should be
confirmed independently — it's possible they share the address or that the suite mix has
shifted again since research.

---

## Border X Brewing — Do Not Add Back

Border X Brewing's Barrio Logan brewpub at 2181 Logan Ave **permanently closed at the end
of 2024**. That space is now Mason Ale Works. Border X does occasional pop-ups in Old Town
only. Do not add it to the guide unless and until they reopen a permanent Barrio Logan
location.

---

## Beaches — Drive Times Confirmed

Drive times verified for the beach and outdoor entries:
- Coronado Beach: ~12 min drive
- Coronado Dog Beach: ~13 min drive
- Coronado Tidelands Park: ~10 min drive
- Embarcadero / Seaport Village: ~12 min drive
- Silver Strand State Beach: ~18 min drive (day-trip)
- Imperial Beach: ~20 min drive (day-trip)
- Sunset Cliffs Natural Park: ~20 min drive (day-trip)
- Ocean Beach: ~18 min drive (day-trip)
- Mission Beach / Belmont Park: ~20 min drive (day-trip)
- La Jolla Cove: ~22 min drive (day-trip)

Distances are estimated from 325 S 30th St and do not account for traffic. Verify exact
times in Google Maps at launch.

---

## Images — Owner Action Required

- **Hero image and category-banner images** are currently decorative Unsplash placeholders.
  They are functional and display well, but the owner should swap them for real photos of
  the property and neighborhood before launch. Update the `imageUrl` fields in
  `src/data/guide.json` (property.imageUrl and each category's imageUrl).
- **Place-level imageUrl** fields are intentionally omitted (infrastructure is in place).
  Add individual place photos by setting `imageUrl` on any place entry — the card renders
  the thumbnail automatically.

---

## General Hours Caveat

Small barrio kitchens, cafes, galleries, and dive bars adjust schedules frequently —
seasonally, for neighborhood events, and sometimes just because. All hours in this guide
are best-available as of June 2026. Spot-check each listing's current hours in Google Maps
or on the venue's Instagram/Facebook close to launch, and again any time you update the
guide.
