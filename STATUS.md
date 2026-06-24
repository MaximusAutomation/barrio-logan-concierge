# Barrio Logan Guest Concierge — STATUS

**Version:** 5
**Last updated:** 2026-06-23 (v5 — guest-services upsell levers + analytics measurement layer on feat/upsell-levers; build green; PR pending)
**State:** Feature branch `feat/upsell-levers` adds Lever 1 (early check-in / late checkout request flow) + Lever 2 (curated affiliate "Book it" links) + measurement dashboard. Build green (npm ci + typecheck + lint + next build, 8 routes). PR to be opened. Main is unchanged.

---

## Where I am, in one sentence

A single-property Airbnb guest microsite (curated local guide + AI concierge chat + guest-services upsell levers + attach-rate analytics) for a 4-room boutique guesthouse at 325 S 30th St, San Diego -- built to measure real attach rates with zero capital.

## Repo

- `MaximusAutomation/barrio-logan-concierge` (private), default branch `main`.
- Local: `/mnt/c/Users/Nahom/Documents/claude-sandbox/barrio-logan-concierge/`.
- Feature branch: `feat/upsell-levers` (PR pending).

## What's done (on main)

- Full Next.js App Router app: curated `src/data/guide.json` (real Barrio Logan content), grounded `/api/chat` streaming concierge (`@ai-sdk/react` `useChat`), client-side 4/day cap (`src/lib/rate-limit.ts`), mobile-first UI.
- Server-side abuse guard: `src/lib/server-rate-limit.ts` (15 req/min/IP).
- Model provider swap: dev = Ollama, prod = Groq (free tier) via env. Anthropic/Claude Haiku documented alternative.
- Phase 1 Concierge-Commerce: 4 partner configs, `/go/[partner]` click-tracked redirect, BookingInfo on Place, services category, amber Book CTA.
- All prior PRs (#1, #2, #3) merged to main.
- Build verified green (4 static + 1 dynamic route on main).

## What's new on feat/upsell-levers (this work)

### Lever 1 -- Early check-in / Late checkout (request flow)
- `src/lib/upsell-config.ts` -- configurable pricing ($35 early check-in, $35 late checkout; host can change prices, enable/disable each option, adjust times).
- `src/components/UpsellSection.tsx` -- guest-facing request cards with selection, form (name, room ref, note), submit, success state. IntersectionObserver tracks upsell-impression events.
- `src/app/api/upsell-request/route.ts` -- validates request, logs to stdout for host notification, returns confirmation. REQUEST-based (manual host approval), not auto-confirm, to avoid overselling when a room is turning over.
- System prompt (rule 8) instructs concierge to tell guests about early/late checkout options and direct them to the request cards.
- Positioned between PropertyHeader and guide tabs for maximum visibility.

### Lever 2 -- Curated affiliate "Book it" links
- `src/lib/partners.ts` -- expanded from 4 to 7 partners: added `brewery-taco-crawl`, `bay-adventure`, `local-dining` (all with Viator/OTA placeholder URLs for ~8% affiliate commission). Each has clear owner-facing notes on which program to join.
- `src/data/guide.json` services category expanded from 4 to 7 bookable places: Brewery & Taco Crawl, Bay & Coronado Adventure, Local Dining Experience (new); Airport Transfer, E-Bike Rental, Browse All Tours, Beach Gear Rental (retained/updated).
- Chicano Park guardrail enforced: no for-profit paid tour OF Chicano Park. Guardrail comment added to partners.ts. Tours entry explicitly notes this.

### Measurement / analytics layer
- `src/lib/analytics.ts` -- client-side event tracker (localStorage-backed + fire-and-forget beacon to `/api/analytics`). Events: `upsell-impression`, `upsell-request`, `booking-impression`, `booking-click`.
- `src/lib/analytics-counters.ts` -- shared server-side in-memory counters (best-effort, resets on cold start).
- `src/app/api/analytics/route.ts` -- receives beaconed events, logs to stdout, increments counters.
- `src/app/api/analytics/counters/route.ts` -- serves counter snapshot to dashboard.
- `src/app/host/dashboard/page.tsx` -- host-facing dashboard at `/host/dashboard` showing: upsell impressions, upsell requests, booking impressions, booking clicks, attach rates (%), clicks by partner, upsell requests by option, time-window filter (1/7/30/90 days), server-side counters, and JSON export for spreadsheet analysis.
- `src/components/PlaceCard.tsx` -- booking-click events tracked client-side on Book CTA clicks.
- `src/components/GuideSection.tsx` -- booking-impression events tracked when services tab is viewed.

### Build verification
- Build green: `npm ci` + `tsc --noEmit` + `eslint` + `next build` all pass.
- 8 routes: `/` (static), `/_not-found` (static), `/api/analytics` (dynamic), `/api/analytics/counters` (dynamic), `/api/chat` (dynamic), `/api/upsell-request` (dynamic), `/go/[partner]` (dynamic), `/host/dashboard` (static).

## What's NOT done (owner-gated)

1. **Merge PR** -- `feat/upsell-levers` into `main`.
2. **Prod model env** as Vercel secrets: `MODEL_PROVIDER=groq` + `GROQ_API_KEY`.
3. **Deploy to Vercel** and **generate QR code**.
4. **Smoke-test** on a real phone.
5. **Affiliate program sign-up** -- join Viator (~8%), GetYourGuide, Jayride; paste tagged URLs into `src/lib/partners.ts`; redeploy.
6. **Upsell pricing review** -- confirm $35 for early-in and late-out is the right price point for this property (configurable in `src/lib/upsell-config.ts`).
7. Optional: add WiFi credentials in `src/data/guide.json`.
8. Optional: rename property from "325 Barrio" if preferred.

## Active next action

Push `feat/upsell-levers`, open PR, await owner review/merge. Then owner deploys and begins measuring attach rates.

## Quick-context pointers

- Spec (source of truth): `PROJECT.md` -- Contract A, Contract B, locked decisions.
- Engineering conventions: `CLAUDE.md`. Owner deploy runbook: `OWNER-DEPLOY.md`.
- Build toolchain (Windows node/git/gh -- Linux node is broken here): see `pm-barrio` agent definition.

## Don't break

- Contract A / Contract B and the locked decisions in `PROJECT.md`.
- The 4/day client-side cap semantics (per-device localStorage, local-midnight reset).
- Secrets server-only, never committed; `.env.local`/`.env`/`node_modules`/`.next` gitignored.
- Chicano Park guardrail: no for-profit paid tour of Chicano Park.

## Changelog

- v1 -- 2026-05-31 -- pm-barrio -- created after migration; app review-fixed, build green, awaiting owner deploy.
- v2 -- 2026-05-31 -- pm-barrio -- deploy audit complete; build re-verified green; owner deploy checklist produced.
- v3 -- 2026-05-31 -- pm-barrio -- Groq provider added; build green; pushed to main.
- v4 -- 2026-05-31 -- pm-barrio -- property tokens filled with defaults; WiFi blanked; build green; pushed to main.
- v5 -- 2026-06-23 -- pm-barrio -- guest-services upsell levers (early/late checkout request flow + curated affiliate "Book it" links) + analytics measurement layer (client-side tracking, server beacons, host dashboard at /host/dashboard); partners expanded to 7; guide.json services category expanded to 7 bookable places; Chicano Park guardrail enforced; build green (8 routes); on feat/upsell-levers branch, PR pending.
