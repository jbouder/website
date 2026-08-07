# website

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

Edit it and the whole site updates — no component changes needed.

## Build & deploy

```bash
bun run build      # production build
bun run deploy     # build + wrangler deploy to Cloudflare
```

First deploy will prompt `wrangler` to log in to your Cloudflare account. To attach a custom domain, add a route in `wrangler.jsonc` or via the Cloudflare dashboard (Workers → website → Domains & Routes).

> **Note:** Cloudflare Pages is in maintenance mode; TanStack Start's official Cloudflare target is Workers with static assets, which this project uses.

## Design notes

- The typing headline is CSS-only (`steps()` animation) — SSR-safe, no hydration mismatch, works without JS.
- Scroll-reveal is progressive enhancement: content is fully visible without JS.
- `prefers-reduced-motion` disables the typewriter, scanline, grid drift, and reveal animations.
