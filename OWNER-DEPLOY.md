# Owner Deploy Runbook — Barrio Logan Guest Concierge

The build workflow produces a locally-verified Next.js app. Deployment is yours.
This document is the step-by-step guide.

---

## Prerequisites

- The app builds cleanly: `npm run build` passes with no errors.
- You have a GitHub account and the repo is pushed there (or on another Git host Vercel can connect to).
- You have a free Groq API key (get one at https://console.groq.com — Settings → API Keys).

---

## Step 1 — Pick your host

### Option A: Vercel Hobby (default — easiest)

**Current free-tier limits (verified May 2026):**

| Resource | Hobby (free) limit |
|---|---|
| Bandwidth | 100 GB / month |
| Serverless function invocations | 1,000,000 / month |
| Edge requests | 1,000,000 / month |
| Active CPU time | 4 hours / month |
| Provisioned memory | 360 GB-hours / month |
| Blob storage | 1 GB |
| Deployments | Unlimited (personal projects) |
| Custom domains | Supported |

For a single Airbnb property with a handful of guests per day, you will not come close to any of these limits. The `/api/chat` route is the only serverless function; each streaming request counts as one invocation.

**Important:** Vercel Hobby is for personal/non-commercial use. If this property is a professional rental business, review Vercel's terms or use Cloudflare instead.

---

### Option B: Cloudflare Pages (more frugal — recommended if commercial)

**Current free-tier limits (verified May 2026):**

| Resource | Free limit |
|---|---|
| Bandwidth (static assets) | Unlimited |
| Workers requests (API/functions) | 100,000 / day |
| Builds | 500 / month |
| Files per site | 20,000 |
| Max file size | 25 MiB |
| Custom domains | Supported |

Static pages (the guide) are served for free with no request cap. The concierge
API calls count against the Workers 100 k/day free quota — again, far more than
a single property needs. Cloudflare has no commercial-use restriction on free tier.

**Cloudflare deploy note:** Cloudflare Pages supports Next.js App Router via
`@cloudflare/next-on-pages`. The build command changes to
`npx @cloudflare/next-on-pages` and you add `export const runtime = "edge"` to
`src/app/api/chat/route.ts`. See https://developers.cloudflare.com/pages/framework-guides/nextjs/ for current instructions.

---

## Step 2 — Connect the repo and deploy

### Vercel

1. Go to https://vercel.com → New Project → Import your Git repo.
2. Vercel auto-detects Next.js. The `vercel.json` in the repo is already configured.
3. Leave the build command as the Vercel default (`next build`).
4. Do NOT set any env vars yet — do that in step 3.
5. Click Deploy. The first deploy will fall back to Ollama (no key set) — that is fine; you fix it in step 3.

### Cloudflare Pages

1. Go to https://dash.cloudflare.com → Workers & Pages → Create → Pages → Connect to Git.
2. Set the build command to `npx @cloudflare/next-on-pages` and the output directory to `.vercel/output/static`.
3. Add `NODE_VERSION=20` as a build env var.
4. Deploy once (it may fail on the chat route without the key — fix in step 3).

---

## Step 3 — Set the model key as a deployment secret

**Never put your API key in the repo or in `.env.example`.**

### Vercel (Groq — recommended prod path)

1. Project → Settings → Environment Variables.
2. Add:
   - `MODEL_PROVIDER` = `groq`
   - `GROQ_API_KEY` = `gsk_...` (mark as **Secret** — get this from https://console.groq.com)
   - `GROQ_MODEL` = `llama-3.3-70b-versatile` (optional — this is the default; omit to use default)
3. Redeploy (Deployments → Redeploy, or push a commit).

### Cloudflare (Groq — recommended prod path)

```bash
wrangler secret put GROQ_API_KEY
# paste your key at the prompt — it never appears in logs
wrangler pages deploy --project-name <your-project>
```

Also set plain vars in the dashboard:
- `MODEL_PROVIDER` = `groq`
- `GROQ_MODEL` = `llama-3.3-70b-versatile` (optional)

### Alternative: Anthropic / Claude Haiku

If you prefer to use Anthropic instead of Groq, get a key at https://console.anthropic.com and set:

**Vercel:**
- `MODEL_PROVIDER` = `anthropic`
- `ANTHROPIC_API_KEY` = `sk-ant-...` (mark as **Secret**)
- `ANTHROPIC_MODEL` = `claude-haiku-4-5` (optional — that is the default)

**Cloudflare:**
```bash
wrangler secret put ANTHROPIC_API_KEY
```
Plus dashboard vars: `MODEL_PROVIDER=anthropic`, `ANTHROPIC_MODEL=claude-haiku-4-5`.

---

## Step 4 — Grab the live URL

After a successful deploy Vercel shows a URL like `https://barrio-logan-concierge.vercel.app`.
Copy it.

---

## Step 5 — Generate the QR code

Once you have the live URL:

```bash
node scripts/generate-qr.mjs https://your-project.vercel.app
```

This writes `room-qr.png` to your working directory.

Alternatively, the direct one-liner (no script needed):

```bash
npx qrcode "https://your-project.vercel.app" -o room-qr.png
```

Print the PNG at 5 cm × 5 cm or larger on a small card and place it in the room.

---

## Step 6 — Smoke-test on your phone

Scan the QR with your phone (not the browser on your laptop — a real mobile device):

1. The landing page loads with property name, wifi, check-in/out info.
2. Browse the guide categories (grocery, food, beaches, activities, transit).
3. Open the chat tab and ask a question about the neighborhood. Confirm it answers from the guide and streams the response.
4. Ask 4 questions total. On the 4th, confirm the "out of questions" message appears.
5. Confirm the chat input is disabled at 0 questions remaining.
6. To test the midnight reset without waiting: open DevTools → Application → Local Storage → delete the `concierge.questions` key → reload. The counter should be back at 4.
7. Ask an off-topic question (e.g., "what is the capital of France?"). The concierge should warmly decline.

---

## Prod model swap summary

| Setting | Dev (.env.local) | Prod/Groq (host secrets) | Prod/Anthropic (alt) |
|---|---|---|---|
| `MODEL_PROVIDER` | `ollama` | `groq` | `anthropic` |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | not needed | not needed |
| `OLLAMA_MODEL` | `llama3.2` | not needed | not needed |
| `GROQ_API_KEY` | not set | set as secret | not needed |
| `GROQ_MODEL` | not set | `llama-3.3-70b-versatile` (or omit for default) | not needed |
| `ANTHROPIC_API_KEY` | not set | not needed | set as secret |
| `ANTHROPIC_MODEL` | not set | not needed | `claude-haiku-4-5` (or omit for default) |

Zero code changes between dev and prod — only env vars differ.

---

## Rate-limit verification notes

The 4/day cap is client-side (localStorage). It is trust-based and by design has
no server-side enforcement. Key behaviors to verify:

- Counter key: `concierge.questions`, format `YYYY-MM-DD:count` (local date, not UTC).
- Stale day (yesterday's date in the key) is treated as 0 — fresh day, counter reset.
- At 0 remaining, the frontend disables the input and shows the out-of-quota message.
- localStorage errors (private browsing, storage full) fail open — the guest is NOT blocked.
- The cap is intentionally easy to bypass; it is a polite daily governor, not a paywall.

Manual reset for testing: DevTools → Application → Local Storage → delete `concierge.questions`.

---

## Swapping in your own photos

The guide supports optional images at three levels: property hero, category banner, and individual place thumbnail. All three use the same `imageUrl` field in `src/data/guide.json`.

### Primary method — drop files into /public/images/ (recommended)

This is the simplest approach and requires no configuration changes.

1. Copy your photo into `public/images/` (e.g. `public/images/my-place.jpg`).
2. Set `imageUrl` in `src/data/guide.json` using the public path:
   - Property hero: `"imageUrl": "/images/my-hero.jpg"` inside the `"property"` block.
   - Category banner: `"imageUrl": "/images/food-banner.jpg"` inside a category object.
   - Individual place: `"imageUrl": "/images/my-place.jpg"` inside a place object.
3. That's it — no `next.config.ts` change needed for local files.

Good formats: JPEG (`.jpg`) for photos, PNG (`.png`) for logos/screenshots. Keep files under 500 KB for fast mobile loads.

### External URLs

If you prefer to host images on your own CDN or another service, you can reference a full `https://` URL as `imageUrl`. **You must also allowlist the host** in `next.config.ts` — otherwise Next.js will return a 500 error when it tries to optimise the image.

To add an external host, open `next.config.ts` and add an entry to `remotePatterns`:

```ts
{
  protocol: "https",
  hostname: "your-cdn.example.com",
},
```

The existing Unsplash entry shows the correct format.

**Note:** Unsplash URLs already work out of the box. Any other external host needs its own entry.

### Removing a photo

Leave `imageUrl` absent (or delete the key) to render without a photo — place cards, category panels, and the property header all degrade gracefully to text-only with no broken image or layout shift.

---

## Earning from bookings (affiliate setup)

The app includes a "Book & Get Around" category with four bookable services — Airport Transfer, E-Bike Rental, Tours & Experiences, and Beach Gear Rental. Each one routes guests through `/go/<key>` (a server-side click-tracked redirect) to your affiliate booking link.

**All partner URLs are currently PLACEHOLDERS.** The app works end-to-end right now (guests can tap "Book" and reach the partner's San Diego page) but you are not yet earning a commission. Follow the steps below to activate real affiliate links.

### Step A — Join the affiliate programs

Sign up for each program you want to activate:

| Service | Program | Sign-up URL |
|---|---|---|
| Airport Transfer | Jayride Affiliates | https://www.jayride.com/affiliates |
| Airport Transfer (alt) | Mozio Partner Program | https://www.mozio.com/en-us/partner/ |
| E-Bike Rental | Wheel Fun Rentals (or local shop) | Contact the shop directly for a referral arrangement |
| Tours & Experiences | Viator Affiliate Program | https://www.viatoraffiliates.com |
| Tours & Experiences (alt) | GetYourGuide Partner Program | https://partner.getyourguide.com |
| Beach Gear / Baby Gear | BabyQuip Partner Program | https://www.babyquip.com/partners or email partner@babyquip.com |

Each program will provide you with an affiliate-tagged URL (often a custom link with your tracking ID embedded).

### Step B — Paste your affiliate links into partners.ts

Open `src/lib/partners.ts` in your editor. For each partner you've joined, replace the `url` value with your affiliate-tagged link:

```ts
// Before (placeholder):
"airport-transfer": {
  label: "Book Airport Transfer",
  url: "https://www.jayride.com/airport-transfers/us/san-diego-international-airport/",
  ...
},

// After (your affiliate link):
"airport-transfer": {
  label: "Book Airport Transfer",
  url: "https://www.jayride.com/.../?ref=YOUR_AFFILIATE_ID",
  ...
},
```

Commit the change and redeploy — that is the entire update. No other files need changing.

**Affiliate URLs are not secrets** — they are ordinary public links with your tracking ID in the query string. It is fine to commit them to the repo.

### Step C — Read your click logs

Every time a guest taps a "Book" button, the `/go/<partner>` route logs a JSON event to stdout:

```json
{ "event": "booking-click", "partner": "airport-transfer", "label": "Book Airport Transfer", "timestamp": "2026-06-03T..." }
```

To view these logs:

- **Vercel:** Dashboard → your project → Functions tab → filter by `/go/` or search for `booking-click`.
- **Cloudflare:** Workers & Pages → your project → Functions → Real-time Logs.

These logs are your attribution record. The affiliate program's dashboard will show confirmed bookings and earnings separately.

### Future phases (not in this PR)

The following upsells are planned for later phases and are NOT included in Phase 1:

- **Host-fulfilled upsells** — early check-in, late check-out, parking passes (handled by the owner directly, no affiliate link needed).
- **B2B host licensing** — making this concierge available to other Airbnb hosts.

---

## Secrets checklist

- [ ] `GROQ_API_KEY` set as a deployment secret (never in the repo)
- [ ] `.env.local` is in `.gitignore` (already configured)
- [ ] No real keys appear in `.env.example` (only placeholder comments)
- [ ] `git log --all -p | grep "gsk_"` returns nothing before first push

---

## Free-tier sources (verified May 2026)

- Groq free tier: https://console.groq.com (no credit card required for free tier)
- Vercel Hobby limits: https://vercel.com/docs/plans/hobby
- Vercel limits reference: https://vercel.com/docs/limits
- Cloudflare Pages limits: https://developers.cloudflare.com/pages/platform/limits/
- Cloudflare Workers pricing: https://developers.cloudflare.com/workers/platform/pricing/
