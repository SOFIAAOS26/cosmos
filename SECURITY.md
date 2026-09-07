# Security

> Priority order (§77): **Security → Correctness → UX → Performance →
> Maintainability → Visual polish.** Never sacrifice security for aesthetics.

## Principle (§28)

```
USER  →  COSMOS MEMBERSHIP  →  AUTHORIZED DATA
```

A user can only ever touch data belonging to a cosmos they are a member of. The
frontend never enforces this — **Row Level Security does**.

## Row Level Security

- RLS is enabled on **every** table.
- The core check is `public.is_cosmos_member(cosmos_id)` — a `SECURITY DEFINER`,
  `STABLE` function that bypasses RLS internally to avoid recursive policy
  evaluation.
- Profile visibility uses `public.shares_cosmos(user_id)` so you can see your
  partner's profile but no one else's.
- Content policies: members may `select/insert/update/delete` within their cosmos;
  author columns (`author_id` / `created_by` / `from_user` / `user_id`) must equal
  `auth.uid()` on insert, so authorship can't be spoofed.
- Membership rows are created **only** through the RPCs; there is no public insert
  policy, so a client cannot add itself to a cosmos directly.

## Verified behavior

The migrations were applied to a real Postgres 16 instance and exercised as the
`authenticated` role with simulated JWTs. Confirmed:

- ✅ A user in cosmos B sees **0** rows from cosmos A (cross-cosmos isolation).
- ✅ A third user cannot join a full cosmos — `accept_invite` raises
  _"Este cosmos ya está completo."_
- ✅ A direct `INSERT` into `cosmos_members` for another cosmos is rejected by RLS.
- ✅ A direct `INSERT` into `tasks` for a cosmos you don't belong to is rejected by RLS.
- ✅ Identity uniqueness per cosmos is enforced.

Re-run these against your own project as part of QA (§52): attempt cross-cosmos
reads, ID manipulation, and joining a complete cosmos.

## Storage (§29)

- Buckets `photos`, `stickers`, `avatars` are **private** (`public = false`).
- Path convention: `<kind>/cosmos/<cosmosId>/...`. Object policies extract the cosmos
  id from the path and require `is_cosmos_member(...)` for read/write.
- Because buckets are private, the client fetches media via **signed URLs** rather
  than public URLs — nothing private is ever served publicly.

## Notes: the "sealed" interaction is UX, not cryptography (§17, §20)

Scheduled/sealed notes gate their reveal with an _animation_, not encryption. RLS
scopes note rows to cosmos members; the lock is an emotional experience
("Hay algo aquí para ti, pero todavía no es el momento"), and the app does not claim
the animation is security. Don't store anything in a note that would be harmful if
the other member read it early.

## Secrets

- Only `VITE_SUPABASE_URL` and the **anon** key ship to the client — both are safe to
  expose; RLS is the protection. The **service_role** key must never be placed in this
  app or committed.
- `.env` is git-ignored; `.env.example` documents the shape without secrets.

## Privacy (§45)

No public profiles, followers, likes, public feed, ads, or invasive tracking. COSMOS
is private to its two people by construction.
