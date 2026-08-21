# Product

## Register

brand

## Users

Hiring managers, collaborators, and fellow engineers landing on jbouder's personal site. They arrive from GitHub, LinkedIn, or a talk, skim for signal (what he builds, how he thinks, how to reach him), and leave in under two minutes. A secondary audience is curious developers poking at the craft itself — the site is a portfolio piece.

## Product Purpose

A single-page personal portfolio for Johnny Bouder, AI Experience Engineer. It exists to communicate taste and capability through its own construction: terminal-native design, local in-browser LLM assistant, deliberate motion. Success = a visitor thinks "this person ships polished, playful, technically deep work" and sends an email.

## Brand Personality

Terminal-native, playful, precise. The voice is a zsh session with a sense of humor ("press esc to exit vim"). Nerdy warmth over corporate polish; every flourish is a working artifact (CSS-only typewriter, WebLLM assistant), not decoration.

## Anti-references

- Generic SaaS-gradient portfolio templates (hero metric cards, gradient text, glassmorphism).
- Sterile "design-system showcase" minimalism with no personality.
- Fake-terminal costume sites where the aesthetic is a skin over a normal page — here the terminal metaphor must stay coherent (commands as headings, prompt characters, tabular data).

## Design Principles

1. **The terminal metaphor is load-bearing.** New UI reads as something a terminal could plausibly render: monospace, prompt characters, ruled rows, ANSI-adjacent color.
2. **Show, don't tell.** Capability is demonstrated by working artifacts, not claims.
3. **Motion is progressive enhancement.** Everything works with JS off and with reduced motion on; animation rewards those who can enjoy it.
4. **One accent does the talking.** Phosphor green carries emphasis; amber is the rare secondary. Restraint everywhere else.
5. **Content lives in `src/data/site.ts`;** components stay copy-free.

## Accessibility & Inclusion

Target WCAG 2.1 AA: 4.5:1 body-text contrast, visible focus, semantic landmarks. `prefers-reduced-motion` fully honored (typewriter, scanline, reveals all disable). Assistant is desktop-only by design and degrades gracefully.
