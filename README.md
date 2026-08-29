# Wivme Website

**The marketing site for [Wivme](https://wivmeai.com), the retention layer for K-12 students.**

Schools teach, students forget most of it within a day, and nothing in between measures whether it stuck. The site's job is to make that gap legible in about thirty seconds, to a parent and to a principal, who arrive wanting very different things.

## What is here

A Next.js app, statically exported. Motion is the point rather than decoration: the scroll carries the argument from the problem to the retention loop, so the page has to hold attention long enough to make it.

| Path | What |
|---|---|
| `src/` | Pages, components and the scroll-driven sections. |
| `server/` | The lead-capture endpoint behind the sign-up form. |
| `public/`, `Favicon/` | Static assets and the icon set. |
| `scripts/generate-og.mjs` | Renders the Open Graph card, so link previews are built rather than screenshotted. |
| `DEPLOY.md` | How it ships. |

## Stack

Next.js 15 · React 19 · TypeScript · GSAP and Lenis for the scroll and motion · Three.js · deployed on Render.

## Running it

```bash
npm install
cp .env.local.example .env.local
npm run dev
```

No credentials are committed. `.env.local.example` lists what the lead-capture endpoint needs.

## A note on the brand

The visual system is locked: violet `#6346E6`, Baloo 2 for headlines, Nunito for body, rounded cards, generous whitespace, no gradients and no drop shadows. Changes to type or colour here should follow the brand board rather than the other way round.
