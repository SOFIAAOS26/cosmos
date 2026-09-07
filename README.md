# 🌌 COSMOS

### _our little universe._

**Two people. One little universe. A lifetime of moments between them.**

COSMOS is a private, installable Progressive Web App for **exactly two people**. It
weaves together **past → present → future**: memories, the day you're living, and the
plans you're waiting for. It's meant to feel _intimate, cinematic, editorial, alive
and human_ — never like a CRM, a corporate dashboard, or a productivity app.

> This repository is the **Foundation milestone** (Hito 1): a fully wired,
> installable app shell with authentication, the two-person cosmos model, the
> Observatory home, a month calendar with day sheets, the Nedi ambient system, a
> complete database with Row Level Security, and the design system. Feature phases
> (memories authoring, task support & check-ins, event tickets, stickers, sealed
> notes, full Nedi) build on top of it.

---

## Tech stack

React · Vite · TypeScript (strict) · Tailwind CSS · Framer Motion · Lucide ·
Supabase (Auth · Postgres · Realtime · Storage) · PWA (vite-plugin-pwa) · Vitest.

## Prerequisites

- **Node 18+** (developed on Node 20/22)
- A **Supabase** project (free tier is fine)

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
#   then fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
#   (Supabase dashboard → Project Settings → API)

# 3. Apply the database schema
#    Option A — Supabase SQL editor: paste each file in supabase/migrations/ in order.
#    Option B — Supabase CLI:
#       supabase link --project-ref <your-ref>
#       supabase db push        # applies supabase/migrations/*.sql

# 4. Run
npm run dev
```

Open the app on your phone (same network, or deploy) and **install it** from the
browser menu — COSMOS is designed mobile-first and to run standalone.

## Scripts

| Script            | What it does                                  |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Vite dev server                               |
| `npm run build`   | Type-check + production build (with PWA)       |
| `npm run preview` | Preview the production build                   |
| `npm run typecheck` | `tsc --noEmit`                              |
| `npm run lint`    | ESLint                                         |
| `npm run test`    | Vitest unit tests                             |

## Environment variables

See [`.env.example`](./.env.example). Never commit `.env`. The anon key is safe in
the client — **Row Level Security** is what protects your data (see
[SECURITY.md](./SECURITY.md)).

## Deployment (Vercel)

1. Import the repo in Vercel.
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables.
3. Framework preset: **Vite**. Build: `npm run build`. Output: `dist`.
4. SPA routing is handled by [`vercel.json`](./vercel.json) (rewrites to
   `index.html`). HTTPS is automatic — required for the service worker / PWA install.

## PWA

- Web manifest + icons live in `public/` and `vite.config.ts`.
- The service worker precaches the app shell and runtime-caches Supabase Storage
  images. Update strategy is `prompt` (the app can offer to reload on a new version).
- `theme-color`, safe-area insets, and standalone display are configured.

## Project structure

```
src/
├── components/
│   ├── ui/          # Design-system primitives (Button, GlassCard, BottomSheet…)
│   ├── nedi/        # Nedi character system (Nedi · Scene · State · Animation · config)
│   ├── brand/       # Logo, Starfield
│   └── layout/      # AppShell, BottomNav, Sidebar, Screen
├── features/        # Screens & flows (boot, auth, onboarding, observatory, calendar…)
├── providers/       # Auth, Cosmos, Toast context
├── hooks/           # useRealtime, useCountdown, useMediaQuery
├── theme/           # tokens (identity), motion grammar
├── types/           # database + domain models
├── utils/           # date (timezone-aware), cn
└── lib/             # supabase client, env
supabase/migrations/ # SQL: schema, RLS, functions, storage
```

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — how the app is put together
- [DATABASE.md](./DATABASE.md) — data model & tables
- [SECURITY.md](./SECURITY.md) — RLS, storage, the two-person model
- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) — tokens, motion, Nedi, microcopy

## Roadmap

- ✅ **Hito 1 — Foundation**: scaffold, design system, Nedi, auth, onboarding,
  cosmos model, Observatory, calendar + day sheet, full DB + RLS + storage, PWA.
- ⏳ **Hito 2** — Memories authoring (postcards, photo upload, soundtrack)
- ⏳ **Hito 3** — Task Radar: support, reactions, completion check-ins (realtime)
- ⏳ **Hito 4** — Events + Ticket UI + Countdown editor + Bucket list
- ⏳ **Hito 5** — Stickers canvas + Notes (immediate / scheduled / sealed)
- ⏳ **Hito 6** — Full Nedi reactions, offline polish, QA & E2E

---

# COSMOS

### _our little universe._
