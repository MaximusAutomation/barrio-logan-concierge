# Barrio Logan Guest Concierge — CLAUDE.md

This is a **Next.js App Router** application (TypeScript, Vercel AI SDK).

The authoritative spec, locked decisions, and contract details are in **`PROJECT.md`**. Read that first before making any changes.

## Quick orientation

- App entry: `src/app/` (App Router pages and layouts)
- AI concierge API: `src/app/api/chat/route.ts` (Contract B — do not change its streaming shape or rate-limit behavior)
- Local guide data: `src/data/guide.json` (Contract A — schema defined in PROJECT.md)
- Rate-limit logic: `src/lib/rate-limit.ts`
- Content scripts: `scripts/` (used to generate guide content)
- Static content assets: `content/`

## Build / verify

```bash
npm ci
npm run typecheck   # tsc --noEmit
npm run lint
npm run build       # next build (also runs TS typecheck)
```

## Owner setup

See `OWNER-DEPLOY.md` for deploy instructions, property token fills, and environment variable setup.
