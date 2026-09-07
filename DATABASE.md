# Database

All migrations live in [`supabase/migrations`](./supabase/migrations) and are applied
in filename order:

| File                  | Contents                                                        |
| --------------------- | -------------------------------------------------------------- |
| `0001_schema.sql`     | Extensions, enums, tables, indexes, triggers, constraints      |
| `0002_rls.sql`        | Row Level Security helpers + policies for every table          |
| `0003_functions.sql`  | `create_cosmos` / `accept_invite` RPCs (SECURITY DEFINER)      |
| `0004_storage.sql`    | Storage buckets + object policies                              |
| `seed.sql` (optional) | Dev-only demo cosmos (§57)                                     |

## The relationship model (§27)

```
COSMOS
 ├── MEMBER 01  (identity: noir | blossom, role: owner)
 └── MEMBER 02  (identity: the other one, role: member)
```

A cosmos has **exactly two** members, enforced three ways:

1. `unique (cosmos_id, user_id)` — no double membership.
2. `unique (cosmos_id, identity)` — the two members have different identities.
3. `enforce_two_members()` trigger — rejects a 3rd insert (`raise exception`).

Membership is only ever created through the SECURITY DEFINER RPCs, which also check
"a user belongs to at most one cosmos" and give friendly error messages.

## Tables

| Table              | Purpose                                                       |
| ------------------ | ------------------------------------------------------------ |
| `profiles`         | One per auth user (display name, identity, avatar). Auto-created on signup via `handle_new_user`. |
| `cosmos`           | The shared universe (name, **timezone**, created_by).        |
| `cosmos_members`   | The two members, their identity & role.                      |
| `cosmos_invites`   | Share codes for inviting the second person.                  |
| `memories`         | Postcards — a day's photo + micro-story.                     |
| `memory_media`     | Additional photos attached to a memory.                      |
| `songs`            | Soundtrack (Spotify/YouTube) for a memory or day.            |
| `stickers`         | Sticker library (global or per-cosmos).                      |
| `memory_stickers`  | Placed stickers (x, y, scale, rotation, z).                  |
| `tasks`            | Task Radar items (priority, category, completion).           |
| `task_support`     | Encouraging messages sent on a task.                         |
| `task_reactions`   | Sticker/emoji reactions to a task.                           |
| `task_checkins`    | "¿Cómo te fue?" mood + note on completion.                   |
| `events`           | Shared events (type, time, location, coordinates).           |
| `bucket_items`     | Bucket list; can be scheduled onto the calendar.             |
| `countdowns`       | Countdown targets; one `is_primary` per cosmos.              |
| `notes`            | Immediate / scheduled / sealed notes.                        |
| `notifications`    | Internal per-recipient events.                               |

## Conventions

- Every content row carries `cosmos_id` — authorization is by cosmos membership,
  never by `user_id` alone (§46).
- `created_at` / `updated_at` everywhere sensible; `updated_at` maintained by the
  `set_updated_at()` trigger (§54).
- Enums are real Postgres enums (`identity`, `task_priority`, `event_type`,
  `note_kind`, `checkin_mood`, `song_platform`, `notification_type`).
- Deletes cascade from `cosmos` down, so removing a cosmos cleans up everything.

## RPCs

- `create_cosmos(p_name, p_identity, p_timezone) → uuid` — creates the cosmos and the
  caller's owner membership.
- `accept_invite(p_code, p_identity) → uuid` — validates the code (exists, not
  expired), enforces the 2-member cap and identity uniqueness, adds the caller and
  marks the invite accepted.

Both are `SECURITY DEFINER` with `search_path = public` and granted to
`authenticated`.

## Regenerating types

Once the Supabase CLI is linked:

```bash
npm run db:types   # supabase gen types typescript --local > src/types/supabase.generated.ts
```

Until then, `src/types/database.ts` is the hand-maintained source of truth.
