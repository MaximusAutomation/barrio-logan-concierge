## Barrio Logan Guest Concierge (Next.js app)

A single-property Airbnb guest microsite with a curated local guide and an AI concierge chat, scoped to 325 S 30th St, San Diego, CA 92113 (Logan Heights / Barrio Logan).

### Setup

```bash
# 1. Install Node dependencies
npm install

# 2. Configure environment
cp .env.example .env.local
# Edit .env.local — for local dev the defaults (MODEL_PROVIDER=ollama) work as-is.
```

### Run Ollama locally (dev model)

```bash
# Install Ollama from https://ollama.com, then pull the default model:
ollama pull llama3.2

# Ollama server starts automatically; verify it's running:
curl http://localhost:11434/api/tags
```

### Dev server

```bash
npm run dev        # http://localhost:3000
npm run typecheck  # tsc --noEmit
npm run lint       # next lint
npm run build      # production build
```

### Swap to Claude Haiku for production

In your deployment environment (e.g., Vercel dashboard), set:
- `MODEL_PROVIDER=anthropic`
- `ANTHROPIC_API_KEY=<your-key>` (as a secret — never committed)
- `ANTHROPIC_MODEL=claude-haiku-4-5` (optional, this is the default)

### Key file paths

| File | Purpose |
|---|---|
| `src/lib/guide.ts` | Shared TypeScript types for guide.json (Contract A) |
| `src/data/guide.json` | Placeholder guide data (Phase 3 swaps in real content) |
| `src/lib/config.ts` | Model-provider helper (dev=Ollama, prod=Claude) |
| `src/app/api/chat/route.ts` | Streaming chat API route (Contract B) |
| `.env.example` | All required env vars documented |

