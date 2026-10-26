# Personal Website

Personal website for [Johnny Bouder](https://github.com/jbouder) — a terminal-themed portfolio built with [TanStack Start](https://tanstack.com/start), React 19, and TypeScript, deployed to Cloudflare Workers.

## Stack

- **Framework:** TanStack Start (SSR) + TanStack Router
- **UI:** React 19, Tailwind CSS v4, JetBrains Mono (self-hosted via Fontsource)
- **Runtime:** Cloudflare Workers with static assets
- **Tooling:** Vite, bun, wrangler

## Development

```bash
bun install
bun run dev        # http://localhost:3000
```

## Editing content

All personal content (name, tagline, work entries, resume, socials) lives in a single file:

```
src/data/site.ts
```

Edit it and the whole site updates — no component changes needed. The `bio` export in
that file is extra detail that never renders on the page but is fair game for the
assistant to answer from.

## Assistant

The `>_ ask` launcher opens a chatbot that answers questions about Johnny. It runs
[WebLLM](https://github.com/mlc-ai/web-llm) — the model executes in the visitor's
browser on WebGPU, so there is no API key, no server, and nothing typed ever leaves
the tab.

- **Model:** Qwen3 1.7B (`src/lib/assistant.ts`). Weights download on first open
  (~1 GB) and are cached by the browser afterwards.
- **Desktop only.** The component returns `null` below 768px rather than asking a
  phone to download and hold the weights.
- **Grounding:** `src/lib/assistant.ts` builds the system prompt from `site.ts`, and
  the model is instructed to answer only from it. Add a fact there, and the assistant
  knows it.
- WebLLM is loaded through `createClientOnlyFn` (`src/lib/assistant-engine.ts`) so its
  ~6 MB bundle stays out of the Cloudflare Worker and is fetched lazily on the client.

## Build & deploy

```bash
bun run build      # production build
bun run deploy     # build + wrangler deploy to Cloudflare
```

Every push to `main` deploys through `.github/workflows/deploy.yml`, using the repo secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. Without the token the deploy job is skipped. To redeploy without a commit, run the workflow by hand (`gh workflow run deploy.yml`).

Deploying from a laptop also works; the first `bun run deploy` prompts `wrangler` to log in to your Cloudflare account. To attach a custom domain, add a route in `wrangler.jsonc` or via the Cloudflare dashboard (Workers → website → Domains & Routes).

> **Note:** Cloudflare Pages is in maintenance mode; TanStack Start's official Cloudflare target is Workers with static assets, which this project uses.

## Design notes

- The typing headline is CSS-only (`steps()` animation) — SSR-safe, no hydration mismatch, works without JS.
- Scroll-reveal is progressive enhancement: content is fully visible without JS.
- `prefers-reduced-motion` disables the typewriter, scanline, grid drift, and reveal animations.
