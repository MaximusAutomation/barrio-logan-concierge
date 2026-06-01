# Barrio Logan Guest Concierge — STATUS

**Version:** 4
**Last updated:** 2026-05-31 (v4 — property tokens filled with defaults; WiFi intentionally blank; deploy-ready)
**State:** Deploy-ready. All property tokens resolved. Awaiting owner: set Vercel env vars (`MODEL_PROVIDER=groq` + `GROQ_API_KEY`), deploy, generate QR.

---

## Where I am, in one sentence

A single-property Airbnb guest microsite (curated local guide + AI concierge chat, 4 questions/guest/day) for 325 S 30th St, San Diego — fully built, all property tokens filled with sensible defaults, WiFi intentionally blank (one-line edit to add), building green, Groq open-source model wired as the production provider — owner can deploy now using the checklist in `OWNER-DEPLOY.md`.

## Repo

- `MaximusAutomation/barrio-logan-concierge` (private), default branch `main`.
- Local: `/mnt/c/Users/Nahom/Documents/claude-sandbox/barrio-logan-concierge/`.
- Migrated 2026-05-31 from `NahomX/AutoJobhunter` branch `claude/new-repo-setup-fRQpI` with filtered, product-only history (13 commits; no legacy Python files).

## What's done

- Full Next.js App Router app: curated `src/data/guide.json` (real Barrio Logan content), grounded `/api/chat` streaming concierge (`@ai-sdk/react` `useChat`), client-side 4/day cap (`src/lib/rate-limit.ts`), mobile-first UI.
- Model provider swap: dev = Ollama, prod = Groq (free tier, open-source Llama model) via env (`MODEL_PROVIDER=groq` + `GROQ_API_KEY`). Anthropic/Claude Haiku remains a documented alternative.
- `@ai-sdk/groq@^3.0.39` added as a dependency. Default prod model: `llama-3.3-70b-versatile` (env-overridable via `GROQ_MODEL`).
- Review fixes shipped pre-migration: added `@ai-sdk/react`; surfaced chat errors to guests + refund quota on failure; declared `zod` directly; bumped chat input to 16px (iOS auto-zoom).
- Build re-verified 2026-05-31 (v4): `npm ci` + `tsc --noEmit` + `eslint` + `next build` all green (Next.js 16.2.6 Turbopack, 4 static routes + 1 dynamic `/api/chat`).
- `vercel.json`: `maxDuration: 30` on `/api/chat`, `Cache-Control: no-store` on `/api/`. Correct for streaming on Vercel Hobby.
- Owner deploy checklist updated in `OWNER-DEPLOY.md` (Groq as default prod path, Anthropic as alternative).
- **Property tokens filled (v4):**
  - `property.name` = `"Barrio Logan Guest Suite"` (placeholder — owner may rename)
  - `property.checkin` = `"3:00 PM"` (standard Airbnb default)
  - `property.checkout` = `"11:00 AM"` (standard default)
  - `property.wifi.ssid` = `""` and `property.wifi.password` = `""` — **intentionally blank** (owner declined to provide WiFi credentials). The WiFi card is fully hidden when both fields are empty; to add WiFi later, fill both `ssid` and `password` in `src/data/guide.json` (one-line edit each). The `showWifi` logic in `src/components/PropertyHeader.tsx` was updated to require both fields non-empty and non-token to display.
  - `houseRules` remains `[]` — acceptable; renders as hidden.
  - No `{{...}}` tokens remain anywhere in `guide.json`.

## What's NOT done (owner-gated)

1. **Prod model env** as Vercel secrets: `MODEL_PROVIDER=groq` + `GROQ_API_KEY` (secret, from https://console.groq.com) + optional `GROQ_MODEL=llama-3.3-70b-versatile`.
2. **Deploy to Vercel** and **generate QR code** (`node scripts/generate-qr.mjs <live-url>`).
3. **Smoke-test** on a real phone (7-step checklist in `OWNER-DEPLOY.md` step 6).
4. Optional: rename `property.name` from "Barrio Logan Guest Suite" to a preferred display name (`src/data/guide.json` line 3).
5. Optional: add WiFi — fill `wifi.ssid` and `wifi.password` in `src/data/guide.json`.
6. Optional/LOW (not blocking): add try/catch around `req.json()`/`streamText` in `src/app/api/chat/route.ts`.

## Active next action

Owner executes the deploy checklist. No further agent work required unless the owner requests additional features.

## Quick-context pointers

- Spec (source of truth): `PROJECT.md` — Contract A (`guide.json` schema), Contract B (`/api/chat`), locked decisions.
- Engineering conventions: `CLAUDE.md`. Owner deploy runbook: `OWNER-DEPLOY.md`.
- Build toolchain (Windows node/git/gh — Linux node is broken here): see the `pm-barrio` agent definition.

## Don't break

- Contract A / Contract B and the locked decisions in `PROJECT.md`.
- The 4/day client-side cap semantics (per-device localStorage, local-midnight reset).
- Secrets server-only, never committed; `.env.local`/`.env`/`node_modules`/`.next` gitignored.

## Changelog

- v1 — 2026-05-31 — pm-barrio — created after migration into the standalone repo; app review-fixed, build green, awaiting owner deploy setup.
- v2 — 2026-05-31 — pm-barrio — deploy audit complete (prod wiring clean, no gaps); build re-verified green (npm ci + typecheck + lint + next build); owner deploy checklist produced; status updated to deploy-ready.
- v3 — 2026-05-31 — pm-barrio — Groq open-source provider added (`@ai-sdk/groq@^3.0.39`, model `llama-3.3-70b-versatile`); `src/lib/config.ts` updated with groq branch; `.env.example` and `OWNER-DEPLOY.md` updated; build re-verified green; pushed to main.
- v4 — 2026-05-31 — pm-barrio — property tokens filled with defaults (name="Barrio Logan Guest Suite", checkin="3:00 PM", checkout="11:00 AM"); WiFi intentionally blanked (ssid="", password=""); PropertyHeader showWifi logic updated to require both fields non-empty; no {{ tokens remain; build re-verified green; pushed to main.
