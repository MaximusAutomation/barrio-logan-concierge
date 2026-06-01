# Barrio Logan Guest Concierge — STATUS

**Version:** 3
**Last updated:** 2026-05-31 (v3 — Groq open-source provider wired; build re-verified; pushed to main)
**State:** Deploy-ready. Prod model is now open-source via Groq (free tier). Awaiting owner: fill 4 property tokens in `src/data/guide.json`, set Vercel env vars (`MODEL_PROVIDER=groq` + `GROQ_API_KEY`), deploy, generate QR.

---

## Where I am, in one sentence

A single-property Airbnb guest microsite (curated local guide + AI concierge chat, 4 questions/guest/day) for 325 S 30th St, San Diego — fully built, review-fixed, building green, Groq open-source model wired as the production provider — owner can deploy now using the checklist in `OWNER-DEPLOY.md`.

## Repo

- `MaximusAutomation/barrio-logan-concierge` (private), default branch `main`.
- Local: `/mnt/c/Users/Nahom/Documents/claude-sandbox/barrio-logan-concierge/`.
- Migrated 2026-05-31 from `NahomX/AutoJobhunter` branch `claude/new-repo-setup-fRQpI` with filtered, product-only history (13 commits; no legacy Python files).

## What's done

- Full Next.js App Router app: curated `src/data/guide.json` (real Barrio Logan content), grounded `/api/chat` streaming concierge (`@ai-sdk/react` `useChat`), client-side 4/day cap (`src/lib/rate-limit.ts`), mobile-first UI.
- Model provider swap: dev = Ollama, prod = Groq (free tier, open-source Llama model) via env (`MODEL_PROVIDER=groq` + `GROQ_API_KEY`). Anthropic/Claude Haiku remains a documented alternative. Model selection is the only code layer changed — Contract B shape untouched.
- `@ai-sdk/groq@^3.0.39` added as a dependency (compatible with `ai@^6`, same provider-utils version as existing `@ai-sdk/anthropic`). Default prod model: `llama-3.3-70b-versatile` (env-overridable via `GROQ_MODEL`).
- Review fixes shipped pre-migration: added `@ai-sdk/react`; surfaced chat errors to guests + refund quota on failure; declared `zod` directly; bumped chat input to 16px (iOS auto-zoom).
- Build re-verified 2026-05-31: `npm ci` + `tsc --noEmit` + `eslint` + `next build` all green (Next.js 16.2.6 Turbopack, 4 static routes + 1 dynamic `/api/chat`).
- `vercel.json`: `maxDuration: 30` on `/api/chat`, `Cache-Control: no-store` on `/api/`. Correct for streaming on Vercel Hobby.
- Owner deploy checklist updated in `OWNER-DEPLOY.md` (Groq as default prod path, Anthropic as alternative).

## What's NOT done (owner-gated)

1. **Fill property tokens** in `src/data/guide.json` (lines 3, 6, 7, 8): `{{PROPERTY_NAME}}` / `{{WIFI_PASSWORD}}` / `{{CHECKIN}}` / `{{CHECKOUT}}`.
2. **Prod model env** as Vercel secrets: `MODEL_PROVIDER=groq` + `GROQ_API_KEY` (secret, from https://console.groq.com) + optional `GROQ_MODEL=llama-3.3-70b-versatile`.
3. **Deploy to Vercel** and **generate QR code** (`node scripts/generate-qr.mjs <live-url>`).
4. **Smoke-test** on a real phone (7-step checklist in `OWNER-DEPLOY.md` step 6).
5. Optional/LOW (not blocking): add try/catch around `req.json()`/`streamText` in `src/app/api/chat/route.ts`.

## Active next action

Owner executes the deploy checklist. No further agent work required unless the owner provides property tokens or requests additional features.

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
