# Architecture

COSMOS is a client-rendered React SPA talking directly to Supabase (Postgres +
Auth + Realtime + Storage). There is no custom backend server — **the database is
the backend**, and Row Level Security is the authorization layer.

## High-level flow

```
                       ┌──────────────────────────────┐
                       │            React SPA          │
                       │  (Vite · TS · Tailwind · FM)  │
                       └───────────────┬──────────────┘
                                       │  @supabase/supabase-js (anon key)
                       ┌───────────────▼──────────────┐
                       │            Supabase           │
                       │  Auth · Postgres(RLS) ·       │
                       │  Realtime · Storage           │
                       └──────────────────────────────┘
```

## Boot & routing gate (`src/App.tsx`)

A single gate decides what to render, in order:

1. **No Supabase config** → `SetupScreen` (friendly first-run guide).
2. Providers mount: `ToastProvider → AuthProvider → CosmosProvider`.
3. **Boot** — the opening animation (`BootScreen`) is held for a brief minimum.
4. **No session** → `AuthScreen` (email + password).
5. **Session, no cosmos** → `Onboarding` (create/join + profile + identity).
6. **Session + cosmos** → `AppShell` with the five areas.

## Providers (`src/providers`)

- **AuthProvider** — Supabase session + the user's `profile` row. Subscribes to
  `onAuthStateChange`; exposes `signIn/signUp/signOut/refreshProfile`.
- **CosmosProvider** — resolves the user's single cosmos, loads both members with
  their profiles, and derives `me` / `partner`. Exposes `createCosmos` / `joinCosmos`
  (thin wrappers over the SQL RPCs).
- **ToastProvider** — quiet, on-brand transient messages.

## Data access

- Reads are plain typed Supabase queries, colocated in feature hooks
  (`useDay`, `useMonthIndicators`, `usePrimaryCountdown`, …).
- Writes live in small `api.ts` modules per feature (e.g. `features/tasks/api.ts`).
- **Realtime** (`hooks/useRealtime.ts`) — `useRealtimeTable(table, cosmosId, handler)`
  subscribes to Postgres changes filtered by `cosmos_id`, keeps the handler in a ref
  (so renders don't resubscribe), cleans up on unmount, and retries on socket drops
  to avoid leaks (§25). Feature hooks use it to refetch on change.

## Types (`src/types`)

- `models.ts` — domain enums/constants (priorities, categories, moods, platforms)
  mirroring the Postgres enums.
- `database.ts` — a hand-written `Database` type for the Supabase client, with
  `Row`/`Insert`/`Update` per table. It is kept in sync with the migrations; once the
  Supabase CLI is linked, `npm run db:types` can regenerate a canonical version.
  - _Note:_ Row shapes are `type` aliases (not `interface`) on purpose — an interface
    lacks an implicit index signature and would fail Supabase's `GenericSchema`
    constraint, collapsing query results to `never`.

## Design system (`src/components/ui`, `src/theme`)

Primitives share spacing, radius, typography, motion and accessibility. Tokens live
in `tailwind.config.ts` (colors, shadows, animations) and `src/theme` (identity +
motion grammar). See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md).

## Nedi (`src/components/nedi`)

A decoupled character system — `Nedi` (render) · `NediScene` (render + whisper of
text) · `NediState` (vocabulary) · `NediAnimation` (motion variants) · `nedi.config`
(state → asset map). Callers decide _when_ Nedi appears; new art is a one-line config
change. Nedi holds no app logic and can vanish from any screen (§5, §67).

## Timezone discipline (`src/utils/date.ts`, §55)

- Postgres stores `timestamptz` in UTC and calendar `date` as plain dates.
- A cosmos has **one** timezone. Day boundaries (`todayKey`, `instantToKey`) are
  computed in that timezone so events never jump a day due to device conversions.
- `DateKey` (`YYYY-MM-DD`) is always interpreted in the cosmos timezone.

## Performance

- Route-level content, lazy image loading, thumbnailed/optimized Nedi assets,
  runtime-cached Storage images, realtime instead of polling. Memory galleries load
  on demand rather than all at once. (Further code-splitting is a polish-phase task.)
